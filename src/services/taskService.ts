import { prisma } from '@/lib/db';
import { MarketplaceTask, TaskApplication, TaskMilestone, TaskDeliverable, TaskEscrow, TaskStatus, ApplicationStatus, MilestoneStatus, DeliverableStatus, EscrowStatus, TaskType } from '@prisma/client';

// Create a new task
export async function createTask(
  postedById: string,
  data: {
    title: string;
    description: string;
    type: TaskType;
    budget?: number;
    price?: number;
    currency?: string;
    unit?: string;
    minOrderQty?: number;
    deadline?: Date;
    contactInfo?: string;
    attachments?: string[];
    milestones?: {
      title: string;
      description?: string;
      amount: number;
      order: number;
    }[];
  }
): Promise<MarketplaceTask> {
  const task = await prisma.marketplaceTask.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      budget: data.budget,
      price: data.price,
      currency: data.currency || 'USD',
      unit: data.unit,
      minOrderQty: data.minOrderQty,
      deadline: data.deadline,
      status: TaskStatus.OPEN,
      postedById,
      contactInfo: data.contactInfo,
      attachments: data.attachments ? { attachments: data.attachments } : undefined,
    },
  });

  // Create milestones if provided
  if (data.milestones && data.milestones.length > 0) {
    await prisma.taskMilestone.createMany({
      data: data.milestones.map(milestone => ({
        taskId: task.id,
        title: milestone.title,
        description: milestone.description,
        amount: milestone.amount,
        order: milestone.order,
        status: MilestoneStatus.PENDING,
      })),
    });
  }

  return task;
}

// Get all tasks
export async function getTasks(
  status?: TaskStatus,
  type?: TaskType,
  search?: string
): Promise<MarketplaceTask[]> {
  const where: Record<string, any> = {};
  
  if (status) {
    where.status = status;
  }
  if (type) {
    where.type = type;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  return await prisma.marketplaceTask.findMany({
    where,
    include: {
      postedBy: true,
      taskApplications: {
        include: { applicant: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get task by ID
export async function getTaskById(taskId: string): Promise<MarketplaceTask | null> {
  return await prisma.marketplaceTask.findUnique({
    where: { id: taskId },
    include: {
      postedBy: true,
      taskApplications: {
        include: { applicant: true },
      },
      taskMilestones: {
        orderBy: { order: 'asc' },
      },
      taskDeliverables: true,
      taskEscrow: true,
    },
  });
}

// Apply to a task
export async function applyToTask(
  taskId: string,
  applicantId: string,
  data: {
    message: string;
    quote?: number;
    deliveryTime?: string;
    bondAmount?: number;
  }
): Promise<TaskApplication> {
  return await prisma.taskApplication.create({
    data: {
      taskId,
      applicantId,
      message: data.message,
      quote: data.quote,
      deliveryTime: data.deliveryTime,
      bondAmount: data.bondAmount,
      bondPaid: false,
      status: ApplicationStatus.PENDING,
    },
  });
}

// Accept application
export async function acceptApplication(
  applicationId: string
): Promise<TaskApplication> {
  // First, get the application to find the task ID
  const application = await prisma.taskApplication.findUnique({
    where: { id: applicationId },
    include: { task: true },
  });

  if (!application) {
    throw new Error('Application not found');
  }

  // Update the application status
  const updatedApplication = await prisma.taskApplication.update({
    where: { id: applicationId },
    data: {
      status: ApplicationStatus.IN_PROGRESS,
      updatedAt: new Date(),
    },
  });

  // Update the task status
  await prisma.marketplaceTask.update({
    where: { id: application.taskId },
    data: {
      status: TaskStatus.IN_PROGRESS,
      updatedAt: new Date(),
    },
  });

  return updatedApplication;
}

// Reject application
export async function rejectApplication(
  applicationId: string
): Promise<TaskApplication> {
  return await prisma.taskApplication.update({
    where: { id: applicationId },
    data: {
      status: ApplicationStatus.REJECTED,
      updatedAt: new Date(),
    },
  });
}

// Submit deliverable
export async function submitDeliverable(
  taskId: string,
  applicantId: string,
  data: {
    title: string;
    description?: string;
    files?: string[];
  }
): Promise<TaskDeliverable> {
  // Verify the applicant is working on this task
  const application = await prisma.taskApplication.findFirst({
    where: {
      taskId,
      applicantId,
      status: ApplicationStatus.IN_PROGRESS,
    },
  });

  if (!application) {
    throw new Error('You are not authorized to submit deliverables for this task');
  }

  return await prisma.taskDeliverable.create({
    data: {
      taskId,
      title: data.title,
      description: data.description,
      files: data.files ? { files: data.files } : undefined,
      submittedAt: new Date(),
      status: DeliverableStatus.SUBMITTED,
    },
  });
}

// Approve deliverable
export async function approveDeliverable(
  deliverableId: string
): Promise<TaskDeliverable> {
  return await prisma.taskDeliverable.update({
    where: { id: deliverableId },
    data: {
      status: DeliverableStatus.APPROVED,
      updatedAt: new Date(),
    },
  });
}

// Reject deliverable
export async function rejectDeliverable(
  deliverableId: string,
  reviewNotes: string
): Promise<TaskDeliverable> {
  return await prisma.taskDeliverable.update({
    where: { id: deliverableId },
    data: {
      status: DeliverableStatus.REJECTED,
      reviewNotes,
      updatedAt: new Date(),
    },
  });
}

// Mark milestone as completed
export async function completeMilestone(
  milestoneId: string
): Promise<TaskMilestone> {
  return await prisma.taskMilestone.update({
    where: { id: milestoneId },
    data: {
      status: MilestoneStatus.COMPLETED,
      updatedAt: new Date(),
    },
  });
}

// Release milestone payment
export async function releaseMilestonePayment(
  milestoneId: string
): Promise<TaskMilestone> {
  const milestone = await prisma.taskMilestone.findUnique({
    where: { id: milestoneId },
    include: { task: { include: { taskEscrow: true } } },
  });

  if (!milestone) {
    throw new Error('Milestone not found');
  }

  if (milestone.status !== MilestoneStatus.COMPLETED) {
    throw new Error('Milestone must be completed before payment can be released');
  }

  // Update milestone status
  const updatedMilestone = await prisma.taskMilestone.update({
    where: { id: milestoneId },
    data: {
      status: MilestoneStatus.PAID,
      updatedAt: new Date(),
    },
  });

  // Update escrow
  if (milestone.task.taskEscrow) {
    await prisma.taskEscrow.update({
      where: { id: milestone.task.taskEscrow.id },
      data: {
        releaseAmount: { increment: milestone.amount },
        holdAmount: { decrement: milestone.amount },
        updatedAt: new Date(),
      },
    });
  }

  return updatedMilestone;
}

// Create escrow for task
export async function createEscrow(
  taskId: string,
  amount: number,
  currency: string = 'USD'
): Promise<TaskEscrow> {
  return await prisma.taskEscrow.create({
    data: {
      taskId,
      amount,
      currency,
      holdAmount: amount,
      status: EscrowStatus.PENDING,
    },
  });
}

// Fund escrow
export async function fundEscrow(
  escrowId: string,
  transactionId: string
): Promise<TaskEscrow> {
  return await prisma.taskEscrow.update({
    where: { id: escrowId },
    data: {
      status: EscrowStatus.FUNDED,
      transactionId,
      updatedAt: new Date(),
    },
  });
}

// Release escrow funds
export async function releaseEscrow(
  escrowId: string,
  amount: number
): Promise<TaskEscrow> {
  const escrow = await prisma.taskEscrow.findUnique({
    where: { id: escrowId },
  });

  if (!escrow) {
    throw new Error('Escrow not found');
  }

  if (amount > escrow.holdAmount) {
    throw new Error('Insufficient funds in escrow');
  }

  return await prisma.taskEscrow.update({
    where: { id: escrowId },
    data: {
      releaseAmount: { increment: amount },
      holdAmount: { decrement: amount },
      status: escrow.holdAmount - amount <= 0 ? EscrowStatus.COMPLETED : EscrowStatus.RELEASING,
      updatedAt: new Date(),
    },
  });
}

// Complete task
export async function completeTask(taskId: string): Promise<MarketplaceTask> {
  // Get the task with its escrow
  const task = await prisma.marketplaceTask.findUnique({
    where: { id: taskId },
    include: { taskEscrow: true },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  // Release any remaining escrow funds
  if (task.taskEscrow && task.taskEscrow.holdAmount > 0) {
    await prisma.taskEscrow.update({
      where: { id: task.taskEscrow.id },
      data: {
        releaseAmount: task.taskEscrow.amount,
        holdAmount: 0,
        status: EscrowStatus.COMPLETED,
        updatedAt: new Date(),
      },
    });
  }

  return await prisma.marketplaceTask.update({
    where: { id: taskId },
    data: {
      status: TaskStatus.COMPLETED,
      updatedAt: new Date(),
    },
  });
}

// Cancel task
export async function cancelTask(taskId: string): Promise<MarketplaceTask> {
  return await prisma.marketplaceTask.update({
    where: { id: taskId },
    data: {
      status: TaskStatus.CANCELLED,
      updatedAt: new Date(),
    },
  });
}

// Mark bond as paid
export async function markBondPaid(
  applicationId: string,
  transactionId: string
): Promise<TaskApplication> {
  return await prisma.taskApplication.update({
    where: { id: applicationId },
    data: {
      bondPaid: true,
      bondTransactionId: transactionId,
      updatedAt: new Date(),
    },
  });
}