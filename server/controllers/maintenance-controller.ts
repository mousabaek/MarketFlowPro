import { Request, Response } from "express";
import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { maintenanceRequests, maintenanceRequestSchema, insertMaintenanceRequestSchema } from "@shared/schema";
import { AIMaintenance } from "../services/ai-maintenance-service";
import { ZodError } from "zod";

export async function getAllMaintenanceRequests(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";
    
    // Non-admins can only see their own requests
    let query = db.select().from(maintenanceRequests);
    if (!isAdmin) {
      query = query.where(eq(maintenanceRequests.userId, userId as number));
    }
    
    const requests = await query.orderBy(desc(maintenanceRequests.updatedAt));
    return res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    return res.status(500).json({ error: "Failed to fetch maintenance requests" });
  }
}

export async function getMaintenanceRequestById(req: Request, res: Response) {
  try {
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }
    
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";
    
    // Build query based on user role
    let query = db.select().from(maintenanceRequests).where(eq(maintenanceRequests.id, requestId));
    if (!isAdmin) {
      query = query.where(and(
        eq(maintenanceRequests.id, requestId),
        eq(maintenanceRequests.userId, userId as number)
      ));
    }
    
    const [request] = await query;
    
    if (!request) {
      return res.status(404).json({ error: "Maintenance request not found" });
    }
    
    return res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching maintenance request:", error);
    return res.status(500).json({ error: "Failed to fetch maintenance request" });
  }
}

export async function createMaintenanceRequest(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Validate request data
    const requestData = insertMaintenanceRequestSchema.parse({
      ...req.body,
      userId
    });
    
    // Insert the request
    const [newRequest] = await db
      .insert(maintenanceRequests)
      .values(requestData)
      .returning();
    
    // Trigger AI analysis in the background
    AIMaintenance.analyzeRequest(newRequest.id)
      .then(success => {
        if (!success) {
          console.error(`Failed to analyze maintenance request #${newRequest.id}`);
        }
      });
    
    return res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating maintenance request:", error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    
    return res.status(500).json({ error: "Failed to create maintenance request" });
  }
}

export async function adminApproveRequest(req: Request, res: Response) {
  try {
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }
    
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";
    
    if (!isAdmin) {
      return res.status(403).json({ error: "Admin privileges required" });
    }
    
    // Get the current request
    const [request] = await db
      .select()
      .from(maintenanceRequests)
      .where(eq(maintenanceRequests.id, requestId));
    
    if (!request) {
      return res.status(404).json({ error: "Maintenance request not found" });
    }
    
    if (request.status !== "pending_approval") {
      return res.status(400).json({ error: "Request is not in pending approval state" });
    }
    
    // Update the request
    const [updatedRequest] = await db
      .update(maintenanceRequests)
      .set({
        adminApproval: true,
        adminId: userId as number,
        adminNotes: req.body.notes || null,
        status: "approved",
        updatedAt: new Date()
      })
      .where(eq(maintenanceRequests.id, requestId))
      .returning();
    
    // Implement the solution in the background
    AIMaintenance.implementSolution(requestId)
      .then(success => {
        if (!success) {
          console.error(`Failed to implement solution for maintenance request #${requestId}`);
        }
      });
    
    return res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Error approving maintenance request:", error);
    return res.status(500).json({ error: "Failed to approve maintenance request" });
  }
}

export async function adminRejectRequest(req: Request, res: Response) {
  try {
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }
    
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";
    
    if (!isAdmin) {
      return res.status(403).json({ error: "Admin privileges required" });
    }
    
    // Get the current request
    const [request] = await db
      .select()
      .from(maintenanceRequests)
      .where(eq(maintenanceRequests.id, requestId));
    
    if (!request) {
      return res.status(404).json({ error: "Maintenance request not found" });
    }
    
    // Update the request
    const [updatedRequest] = await db
      .update(maintenanceRequests)
      .set({
        adminApproval: false,
        adminId: userId as number,
        adminNotes: req.body.notes || "Request rejected by admin",
        status: "rejected",
        updatedAt: new Date()
      })
      .where(eq(maintenanceRequests.id, requestId))
      .returning();
    
    return res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Error rejecting maintenance request:", error);
    return res.status(500).json({ error: "Failed to reject maintenance request" });
  }
}