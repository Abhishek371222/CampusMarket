import { z } from 'zod';
import {
  insertUserSchema,
  insertProductSchema,
  insertOrderSchema,
  users,
  products,
  orders,
  reviews,
  favorites,
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// Even though we are using client-side mock data, we define the API shape for consistency
export const api = {
  auth: {
    signup: {
      method: 'POST' as const,
      path: '/api/auth/signup',
      input: insertUserSchema.omit({ role: true }), // role is assigned server-side
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }),
      responses: {
        200: z.object({
          user: z.custom<typeof users.$inferSelect>(),
        }),
        401: errorSchemas.validation,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.validation,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        204: z.undefined(),
      },
    },
    google: {
      method: 'POST' as const,
      path: '/api/auth/google',
      input: z.object({
        idToken: z.string(), // Google ID token from client
      }),
      responses: {
        200: z.object({
          user: z.custom<typeof users.$inferSelect>(),
        }),
        401: errorSchemas.validation,
      },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  favorites: {
    list: {
      method: 'GET' as const,
      path: '/api/favorites',
      responses: {
        200: z.array(z.custom<typeof favorites.$inferSelect>()),
      },
    },
    toggle: {
      method: 'POST' as const,
      path: '/api/favorites',
      input: z.object({
        productId: z.number(),
      }),
      responses: {
        200: z.object({ status: z.enum(['added', 'removed']) }),
      },
    },
  },
  reviews: {
    listForProduct: {
      method: 'GET' as const,
      path: '/api/products/:id/reviews',
      responses: {
        200: z.array(z.custom<typeof reviews.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products/:id/reviews',
      input: z.object({
        rating: z.number().min(1).max(5),
        comment: z.string().max(1000).optional(),
      }),
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
      },
    },
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: insertOrderSchema,
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
