import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AdminUser, AdminUserList, AiGenerateQuestionsBody, AiGenerateQuestionsResult, Category, CategoryList, CreateCategoryBody, CreateCodesBody, CreateProductBody, CreateQuestionBody, Game, GameOrNull, HealthStatus, ListQuestionsParams, Me, Product, ProductList, PromoCodeList, Question, RedeemCodeBody, RedeemResult, StartGameBody, UpdateCategoryBody, UpdateGameBody, UpdateProductBody, UpdateQuestionBody, UpdateUserBody } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getListProductsUrl: () => string;
export declare const listProducts: (options?: RequestInit) => Promise<ProductList>;
export declare const getListProductsQueryKey: () => readonly ["/api/products"];
export declare const getListProductsQueryOptions: <TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProductsQueryResult = NonNullable<Awaited<ReturnType<typeof listProducts>>>;
export type ListProductsQueryError = ErrorType<unknown>;
export declare function useListProducts<TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminListProductsUrl: () => string;
export declare const adminListProducts: (options?: RequestInit) => Promise<ProductList>;
export declare const getAdminListProductsQueryKey: () => readonly ["/api/admin/products"];
export declare const getAdminListProductsQueryOptions: <TData = Awaited<ReturnType<typeof adminListProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListProductsQueryResult = NonNullable<Awaited<ReturnType<typeof adminListProducts>>>;
export type AdminListProductsQueryError = ErrorType<unknown>;
export declare function useAdminListProducts<TData = Awaited<ReturnType<typeof adminListProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateProductUrl: () => string;
export declare const createProduct: (createProductBody: CreateProductBody, options?: RequestInit) => Promise<Product>;
export declare const getCreateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<CreateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<CreateProductBody>;
}, TContext>;
export type CreateProductMutationResult = NonNullable<Awaited<ReturnType<typeof createProduct>>>;
export type CreateProductMutationBody = BodyType<CreateProductBody>;
export type CreateProductMutationError = ErrorType<unknown>;
export declare const useCreateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<CreateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<CreateProductBody>;
}, TContext>;
export declare const getUpdateProductUrl: (id: number) => string;
export declare const updateProduct: (id: number, updateProductBody: UpdateProductBody, options?: RequestInit) => Promise<Product>;
export declare const getUpdateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        id: number;
        data: BodyType<UpdateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
    id: number;
    data: BodyType<UpdateProductBody>;
}, TContext>;
export type UpdateProductMutationResult = NonNullable<Awaited<ReturnType<typeof updateProduct>>>;
export type UpdateProductMutationBody = BodyType<UpdateProductBody>;
export type UpdateProductMutationError = ErrorType<unknown>;
export declare const useUpdateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        id: number;
        data: BodyType<UpdateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProduct>>, TError, {
    id: number;
    data: BodyType<UpdateProductBody>;
}, TContext>;
export declare const getDeleteProductUrl: (id: number) => string;
export declare const deleteProduct: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
    id: number;
}, TContext>;
export type DeleteProductMutationResult = NonNullable<Awaited<ReturnType<typeof deleteProduct>>>;
export type DeleteProductMutationError = ErrorType<unknown>;
export declare const useDeleteProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteProduct>>, TError, {
    id: number;
}, TContext>;
export declare const getAiGenerateQuestionsUrl: () => string;
export declare const aiGenerateQuestions: (aiGenerateQuestionsBody: AiGenerateQuestionsBody, options?: RequestInit) => Promise<AiGenerateQuestionsResult>;
export declare const getAiGenerateQuestionsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof aiGenerateQuestions>>, TError, {
        data: BodyType<AiGenerateQuestionsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof aiGenerateQuestions>>, TError, {
    data: BodyType<AiGenerateQuestionsBody>;
}, TContext>;
export type AiGenerateQuestionsMutationResult = NonNullable<Awaited<ReturnType<typeof aiGenerateQuestions>>>;
export type AiGenerateQuestionsMutationBody = BodyType<AiGenerateQuestionsBody>;
export type AiGenerateQuestionsMutationError = ErrorType<unknown>;
export declare const useAiGenerateQuestions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof aiGenerateQuestions>>, TError, {
        data: BodyType<AiGenerateQuestionsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof aiGenerateQuestions>>, TError, {
    data: BodyType<AiGenerateQuestionsBody>;
}, TContext>;
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMeUrl: () => string;
export declare const getMe: (options?: RequestInit) => Promise<Me>;
export declare const getGetMeQueryKey: () => readonly ["/api/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<unknown>;
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListCategoriesUrl: () => string;
export declare const listCategories: (options?: RequestInit) => Promise<CategoryList>;
export declare const getListCategoriesQueryKey: () => readonly ["/api/categories"];
export declare const getListCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof listCategories>>>;
export type ListCategoriesQueryError = ErrorType<unknown>;
export declare function useListCategories<TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetActiveGameUrl: () => string;
export declare const getActiveGame: (options?: RequestInit) => Promise<GameOrNull>;
export declare const getGetActiveGameQueryKey: () => readonly ["/api/game/active"];
export declare const getGetActiveGameQueryOptions: <TData = Awaited<ReturnType<typeof getActiveGame>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getActiveGame>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getActiveGame>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetActiveGameQueryResult = NonNullable<Awaited<ReturnType<typeof getActiveGame>>>;
export type GetActiveGameQueryError = ErrorType<unknown>;
export declare function useGetActiveGame<TData = Awaited<ReturnType<typeof getActiveGame>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getActiveGame>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateActiveGameUrl: () => string;
export declare const updateActiveGame: (updateGameBody: UpdateGameBody, options?: RequestInit) => Promise<Game>;
export declare const getUpdateActiveGameMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateActiveGame>>, TError, {
        data: BodyType<UpdateGameBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateActiveGame>>, TError, {
    data: BodyType<UpdateGameBody>;
}, TContext>;
export type UpdateActiveGameMutationResult = NonNullable<Awaited<ReturnType<typeof updateActiveGame>>>;
export type UpdateActiveGameMutationBody = BodyType<UpdateGameBody>;
export type UpdateActiveGameMutationError = ErrorType<unknown>;
export declare const useUpdateActiveGame: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateActiveGame>>, TError, {
        data: BodyType<UpdateGameBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateActiveGame>>, TError, {
    data: BodyType<UpdateGameBody>;
}, TContext>;
export declare const getEndActiveGameUrl: () => string;
export declare const endActiveGame: (options?: RequestInit) => Promise<void>;
export declare const getEndActiveGameMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof endActiveGame>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof endActiveGame>>, TError, void, TContext>;
export type EndActiveGameMutationResult = NonNullable<Awaited<ReturnType<typeof endActiveGame>>>;
export type EndActiveGameMutationError = ErrorType<unknown>;
export declare const useEndActiveGame: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof endActiveGame>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof endActiveGame>>, TError, void, TContext>;
export declare const getStartGameUrl: () => string;
export declare const startGame: (startGameBody: StartGameBody, options?: RequestInit) => Promise<Game>;
export declare const getStartGameMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startGame>>, TError, {
        data: BodyType<StartGameBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof startGame>>, TError, {
    data: BodyType<StartGameBody>;
}, TContext>;
export type StartGameMutationResult = NonNullable<Awaited<ReturnType<typeof startGame>>>;
export type StartGameMutationBody = BodyType<StartGameBody>;
export type StartGameMutationError = ErrorType<unknown>;
export declare const useStartGame: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startGame>>, TError, {
        data: BodyType<StartGameBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof startGame>>, TError, {
    data: BodyType<StartGameBody>;
}, TContext>;
export declare const getRedeemCodeUrl: () => string;
export declare const redeemCode: (redeemCodeBody: RedeemCodeBody, options?: RequestInit) => Promise<RedeemResult>;
export declare const getRedeemCodeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof redeemCode>>, TError, {
        data: BodyType<RedeemCodeBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof redeemCode>>, TError, {
    data: BodyType<RedeemCodeBody>;
}, TContext>;
export type RedeemCodeMutationResult = NonNullable<Awaited<ReturnType<typeof redeemCode>>>;
export type RedeemCodeMutationBody = BodyType<RedeemCodeBody>;
export type RedeemCodeMutationError = ErrorType<unknown>;
export declare const useRedeemCode: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof redeemCode>>, TError, {
        data: BodyType<RedeemCodeBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof redeemCode>>, TError, {
    data: BodyType<RedeemCodeBody>;
}, TContext>;
export declare const getCreateCategoryUrl: () => string;
export declare const createCategory: (createCategoryBody: CreateCategoryBody, options?: RequestInit) => Promise<Category>;
export declare const getCreateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CreateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CreateCategoryBody>;
}, TContext>;
export type CreateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof createCategory>>>;
export type CreateCategoryMutationBody = BodyType<CreateCategoryBody>;
export type CreateCategoryMutationError = ErrorType<unknown>;
export declare const useCreateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CreateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CreateCategoryBody>;
}, TContext>;
export declare const getUpdateCategoryUrl: (id: number) => string;
export declare const updateCategory: (id: number, updateCategoryBody: UpdateCategoryBody, options?: RequestInit) => Promise<Category>;
export declare const getUpdateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
        id: number;
        data: BodyType<UpdateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
    id: number;
    data: BodyType<UpdateCategoryBody>;
}, TContext>;
export type UpdateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof updateCategory>>>;
export type UpdateCategoryMutationBody = BodyType<UpdateCategoryBody>;
export type UpdateCategoryMutationError = ErrorType<unknown>;
export declare const useUpdateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
        id: number;
        data: BodyType<UpdateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCategory>>, TError, {
    id: number;
    data: BodyType<UpdateCategoryBody>;
}, TContext>;
export declare const getDeleteCategoryUrl: (id: number) => string;
export declare const deleteCategory: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
    id: number;
}, TContext>;
export type DeleteCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCategory>>>;
export type DeleteCategoryMutationError = ErrorType<unknown>;
export declare const useDeleteCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCategory>>, TError, {
    id: number;
}, TContext>;
export declare const getListQuestionsUrl: (params?: ListQuestionsParams) => string;
export declare const listQuestions: (params?: ListQuestionsParams, options?: RequestInit) => Promise<Question[]>;
export declare const getListQuestionsQueryKey: (params?: ListQuestionsParams) => readonly ["/api/admin/questions", ...ListQuestionsParams[]];
export declare const getListQuestionsQueryOptions: <TData = Awaited<ReturnType<typeof listQuestions>>, TError = ErrorType<unknown>>(params?: ListQuestionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuestions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listQuestions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListQuestionsQueryResult = NonNullable<Awaited<ReturnType<typeof listQuestions>>>;
export type ListQuestionsQueryError = ErrorType<unknown>;
export declare function useListQuestions<TData = Awaited<ReturnType<typeof listQuestions>>, TError = ErrorType<unknown>>(params?: ListQuestionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuestions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateQuestionUrl: () => string;
export declare const createQuestion: (createQuestionBody: CreateQuestionBody, options?: RequestInit) => Promise<Question>;
export declare const getCreateQuestionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createQuestion>>, TError, {
        data: BodyType<CreateQuestionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createQuestion>>, TError, {
    data: BodyType<CreateQuestionBody>;
}, TContext>;
export type CreateQuestionMutationResult = NonNullable<Awaited<ReturnType<typeof createQuestion>>>;
export type CreateQuestionMutationBody = BodyType<CreateQuestionBody>;
export type CreateQuestionMutationError = ErrorType<unknown>;
export declare const useCreateQuestion: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createQuestion>>, TError, {
        data: BodyType<CreateQuestionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createQuestion>>, TError, {
    data: BodyType<CreateQuestionBody>;
}, TContext>;
export declare const getUpdateQuestionUrl: (id: number) => string;
export declare const updateQuestion: (id: number, updateQuestionBody: UpdateQuestionBody, options?: RequestInit) => Promise<Question>;
export declare const getUpdateQuestionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateQuestion>>, TError, {
        id: number;
        data: BodyType<UpdateQuestionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateQuestion>>, TError, {
    id: number;
    data: BodyType<UpdateQuestionBody>;
}, TContext>;
export type UpdateQuestionMutationResult = NonNullable<Awaited<ReturnType<typeof updateQuestion>>>;
export type UpdateQuestionMutationBody = BodyType<UpdateQuestionBody>;
export type UpdateQuestionMutationError = ErrorType<unknown>;
export declare const useUpdateQuestion: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateQuestion>>, TError, {
        id: number;
        data: BodyType<UpdateQuestionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateQuestion>>, TError, {
    id: number;
    data: BodyType<UpdateQuestionBody>;
}, TContext>;
export declare const getDeleteQuestionUrl: (id: number) => string;
export declare const deleteQuestion: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteQuestionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteQuestion>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteQuestion>>, TError, {
    id: number;
}, TContext>;
export type DeleteQuestionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteQuestion>>>;
export type DeleteQuestionMutationError = ErrorType<unknown>;
export declare const useDeleteQuestion: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteQuestion>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteQuestion>>, TError, {
    id: number;
}, TContext>;
export declare const getListUsersUrl: () => string;
export declare const listUsers: (options?: RequestInit) => Promise<AdminUserList>;
export declare const getListUsersQueryKey: () => readonly ["/api/admin/users"];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateUserUrl: (id: string) => string;
export declare const updateUser: (id: string, updateUserBody: UpdateUserBody, options?: RequestInit) => Promise<AdminUser>;
export declare const getUpdateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: string;
        data: BodyType<UpdateUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: string;
    data: BodyType<UpdateUserBody>;
}, TContext>;
export type UpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateUser>>>;
export type UpdateUserMutationBody = BodyType<UpdateUserBody>;
export type UpdateUserMutationError = ErrorType<unknown>;
export declare const useUpdateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: string;
        data: BodyType<UpdateUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: string;
    data: BodyType<UpdateUserBody>;
}, TContext>;
export declare const getListCodesUrl: () => string;
export declare const listCodes: (options?: RequestInit) => Promise<PromoCodeList>;
export declare const getListCodesQueryKey: () => readonly ["/api/admin/codes"];
export declare const getListCodesQueryOptions: <TData = Awaited<ReturnType<typeof listCodes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCodes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCodes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCodesQueryResult = NonNullable<Awaited<ReturnType<typeof listCodes>>>;
export type ListCodesQueryError = ErrorType<unknown>;
export declare function useListCodes<TData = Awaited<ReturnType<typeof listCodes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCodes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCodesUrl: () => string;
export declare const createCodes: (createCodesBody: CreateCodesBody, options?: RequestInit) => Promise<PromoCodeList>;
export declare const getCreateCodesMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCodes>>, TError, {
        data: BodyType<CreateCodesBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCodes>>, TError, {
    data: BodyType<CreateCodesBody>;
}, TContext>;
export type CreateCodesMutationResult = NonNullable<Awaited<ReturnType<typeof createCodes>>>;
export type CreateCodesMutationBody = BodyType<CreateCodesBody>;
export type CreateCodesMutationError = ErrorType<unknown>;
export declare const useCreateCodes: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCodes>>, TError, {
        data: BodyType<CreateCodesBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCodes>>, TError, {
    data: BodyType<CreateCodesBody>;
}, TContext>;
export declare const getDeleteCodeUrl: (id: number) => string;
export declare const deleteCode: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCodeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCode>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCode>>, TError, {
    id: number;
}, TContext>;
export type DeleteCodeMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCode>>>;
export type DeleteCodeMutationError = ErrorType<unknown>;
export declare const useDeleteCode: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCode>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCode>>, TError, {
    id: number;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map