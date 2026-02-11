import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { Permission } from '../utils/permissions';

const router = Router();

/**
 * Example: Route protected by authentication only
 * Any authenticated user can access this
 */
router.get('/profile', authenticate, (req: Request, res: Response) => {
  res.json({
    message: 'This is a protected route',
    user: req.user,
  });
});

/**
 * Example: Route protected by role-based authorization
 * Only admins and recruiters can access this
 */
router.get('/admin-only', authenticate, authorize('admin', 'recruiter'), (req: Request, res: Response) => {
  res.json({
    message: 'This route is only accessible to admins and recruiters',
    user: req.user,
  });
});

/**
 * Example: Route protected by specific permission
 * Only users with CREATE_EVENT permission can access this
 */
router.post(
  '/events',
  authenticate,
  requirePermission(Permission.CREATE_EVENT),
  (req: Request, res: Response) => {
    res.json({
      message: 'Event created successfully',
      user: req.user,
    });
  }
);

/**
 * Example: Public route (no authentication required)
 */
router.get('/public', (_req: Request, res: Response) => {
  res.json({
    message: 'This is a public route',
  });
});

export default router;
