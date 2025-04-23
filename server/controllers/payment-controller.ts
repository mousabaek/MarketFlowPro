import { Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Validation schemas
const withdrawalRequestSchema = z.object({
  amount: z.number().min(50, "Minimum withdrawal amount is $50"),
  paymentMethod: z.enum(["paypal", "bank", "stripe"], {
    required_error: "Payment method is required",
  }),
  accountDetails: z.string().optional(),
});

export type WithdrawalRequest = z.infer<typeof withdrawalRequestSchema>;

// Payment status enum
export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

/**
 * Controller for payment-related endpoints
 */
export class PaymentController {
  /**
   * Request a withdrawal
   */
  static async requestWithdrawal(req: Request, res: Response) {
    try {
      const userId = req.body.userId || 1; // In production, get from authenticated user
      const validatedData = withdrawalRequestSchema.parse(req.body);
      
      // Check if user has sufficient balance
      const userBalance = await storage.getUserBalance(userId);
      
      if (!userBalance || userBalance < validatedData.amount) {
        return res.status(400).json({
          error: "Insufficient balance for withdrawal"
        });
      }
      
      // Check withdrawal limits
      const dailyWithdrawals = await storage.getUserDailyWithdrawals(userId);
      const dailyTotal = dailyWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0);
      
      if (dailyTotal + validatedData.amount > 500) {
        return res.status(400).json({
          error: "Daily withdrawal limit of $500 exceeded",
          dailyLimit: 500,
          dailyTotal: dailyTotal,
          remaining: 500 - dailyTotal
        });
      }
      
      // Create withdrawal record
      const withdrawal = await storage.createWithdrawal({
        userId,
        amount: validatedData.amount.toString(),
        paymentMethod: validatedData.paymentMethod,
        accountDetails: validatedData.accountDetails || "",
        status: PaymentStatus.PENDING,
        platformFee: (validatedData.amount * 0.2).toString(), // 20% platform fee
        netAmount: (validatedData.amount * 0.8).toString(), // 80% for user
        requestedAt: new Date(),
        processedAt: null,
        completedAt: null,
        transactionId: null,
        notes: null
      });
      
      // Update user balance
      await storage.updateUserBalance(userId, userBalance - validatedData.amount);
      
      // Create activity record
      await storage.createActivity({
        type: "payment",
        title: "Withdrawal Request",
        description: `Requested withdrawal of $${validatedData.amount.toFixed(2)} via ${validatedData.paymentMethod}`
      });
      
      return res.status(201).json(withdrawal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          error: validationError.message
        });
      }
      console.error("Error processing withdrawal request:", error);
      return res.status(500).json({
        error: "Failed to process withdrawal request"
      });
    }
  }
  
  /**
   * Get user withdrawal history
   */
  static async getWithdrawalHistory(req: Request, res: Response) {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : 1; // In production, get from authenticated user
      const withdrawals = await storage.getUserWithdrawals(userId);
      
      return res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      return res.status(500).json({
        error: "Failed to fetch withdrawal history"
      });
    }
  }
  
  /**
   * Get user balance and earnings info
   */
  static async getUserFinancials(req: Request, res: Response) {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : 1; // In production, get from authenticated user
      
      const balance = await storage.getUserBalance(userId);
      const pendingEarnings = await storage.getUserPendingEarnings(userId);
      const totalEarnings = await storage.getUserTotalEarnings(userId);
      const platformFees = await storage.getUserPlatformFees(userId);
      
      // Get earnings breakdown by platform
      const platformEarnings = await storage.getUserPlatformEarnings(userId);
      
      // Calculate earnings percentage by platform
      const totalPlatformEarnings = platformEarnings.reduce((sum, p) => 
        sum + (p.amount ? parseFloat(p.amount.toString()) : 0), 0);
      
      const earningsBreakdown = platformEarnings.map(p => ({
        platform: p.platformName,
        amount: p.amount ? parseFloat(p.amount.toString()) : 0,
        percentage: totalPlatformEarnings > 0 && p.amount 
          ? Math.round((parseFloat(p.amount.toString()) / totalPlatformEarnings) * 100) 
          : 0
      }));
      
      return res.json({
        balance,
        pendingEarnings,
        totalEarnings,
        platformFees,
        earningsBreakdown
      });
    } catch (error) {
      console.error("Error fetching user financials:", error);
      return res.status(500).json({
        error: "Failed to fetch user financial information"
      });
    }
  }
  
  /**
   * Get user payment methods
   */
  static async getPaymentMethods(req: Request, res: Response) {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : 1; // In production, get from authenticated user
      const paymentMethods = await storage.getUserPaymentMethods(userId);
      
      return res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      return res.status(500).json({
        error: "Failed to fetch payment methods"
      });
    }
  }
  
  /**
   * Add a payment method
   */
  static async addPaymentMethod(req: Request, res: Response) {
    try {
      const userId = req.body.userId || 1; // In production, get from authenticated user
      
      const paymentMethodSchema = z.object({
        type: z.enum(["paypal", "bank", "stripe"]),
        accountName: z.string().min(1, "Account name is required"),
        accountDetails: z.string().min(1, "Account details are required"),
        isDefault: z.boolean().default(false)
      });
      
      const validatedData = paymentMethodSchema.parse(req.body);
      
      const paymentMethod = await storage.createPaymentMethod({
        userId,
        type: validatedData.type,
        accountName: validatedData.accountName,
        accountDetails: validatedData.accountDetails,
        isDefault: validatedData.isDefault
      });
      
      return res.status(201).json(paymentMethod);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          error: validationError.message
        });
      }
      console.error("Error adding payment method:", error);
      return res.status(500).json({
        error: "Failed to add payment method"
      });
    }
  }
  
  /**
   * Update payment method
   */
  static async updatePaymentMethod(req: Request, res: Response) {
    try {
      const methodId = parseInt(req.params.id);
      const userId = req.body.userId || 1; // In production, get from authenticated user
      
      // Check if payment method exists and belongs to user
      const existingMethod = await storage.getPaymentMethod(methodId);
      
      if (!existingMethod) {
        return res.status(404).json({
          error: "Payment method not found"
        });
      }
      
      if (existingMethod.userId !== userId) {
        return res.status(403).json({
          error: "You don't have permission to update this payment method"
        });
      }
      
      const paymentMethod = await storage.updatePaymentMethod(methodId, req.body);
      
      return res.json(paymentMethod);
    } catch (error) {
      console.error("Error updating payment method:", error);
      return res.status(500).json({
        error: "Failed to update payment method"
      });
    }
  }
  
  /**
   * Delete payment method
   */
  static async deletePaymentMethod(req: Request, res: Response) {
    try {
      const methodId = parseInt(req.params.id);
      const userId = req.body.userId || 1; // In production, get from authenticated user
      
      // Check if payment method exists and belongs to user
      const existingMethod = await storage.getPaymentMethod(methodId);
      
      if (!existingMethod) {
        return res.status(404).json({
          error: "Payment method not found"
        });
      }
      
      if (existingMethod.userId !== userId) {
        return res.status(403).json({
          error: "You don't have permission to delete this payment method"
        });
      }
      
      const deleted = await storage.deletePaymentMethod(methodId);
      
      if (!deleted) {
        return res.status(500).json({
          error: "Failed to delete payment method"
        });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting payment method:", error);
      return res.status(500).json({
        error: "Failed to delete payment method"
      });
    }
  }
  
  /**
   * Cancel a pending withdrawal request
   */
  static async cancelWithdrawal(req: Request, res: Response) {
    try {
      const withdrawalId = parseInt(req.params.id);
      const userId = req.body.userId || 1; // In production, get from authenticated user
      
      // Check if withdrawal exists and belongs to user
      const withdrawal = await storage.getWithdrawal(withdrawalId);
      
      if (!withdrawal) {
        return res.status(404).json({
          error: "Withdrawal request not found"
        });
      }
      
      if (withdrawal.userId !== userId) {
        return res.status(403).json({
          error: "You don't have permission to cancel this withdrawal"
        });
      }
      
      if (withdrawal.status !== PaymentStatus.PENDING) {
        return res.status(400).json({
          error: `Cannot cancel withdrawal with status: ${withdrawal.status}`
        });
      }
      
      // Refund amount to user's balance
      const userBalance = await storage.getUserBalance(userId);
      const withdrawalAmount = parseFloat(withdrawal.amount);
      await storage.updateUserBalance(userId, userBalance + withdrawalAmount);
      
      // Update withdrawal status
      const updatedWithdrawal = await storage.updateWithdrawal(withdrawalId, {
        status: PaymentStatus.FAILED,
        notes: "Cancelled by user"
      });
      
      // Create activity record
      await storage.createActivity({
        type: "payment",
        title: "Withdrawal Cancelled",
        description: `Cancelled withdrawal request of $${withdrawalAmount.toFixed(2)}`
      });
      
      return res.json(updatedWithdrawal);
    } catch (error) {
      console.error("Error cancelling withdrawal:", error);
      return res.status(500).json({
        error: "Failed to cancel withdrawal"
      });
    }
  }
}