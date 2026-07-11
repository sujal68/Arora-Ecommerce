import { createBrowserRouter } from "react-router";
import App from "../App";
import LoginPage from "../pages/auth/loginPage";
import dashboard from "../pages/auth/Dashboard/dashboard";
import AddAdminPage from "../pages/admins/addAdmin";
import ViewAdminsPage from "../pages/admins/viewAdmin";
import AddUserPage from "../pages/users/addUsers";
import ViewUsersPage from "../pages/users/viewUsers";
import CategoriesPage from "../pages/categories/categories";
import SubCategoriesPage from "../pages/categories/subCategories";
import ExtraCategoriesPage from "../pages/categories/extraCategories";
import AddProductPage from "../pages/product/addProducts";
import ViewProductsPage from "../pages/product/viewProducts";
import OrdersPage from "../pages/orders/orders";
import SettingsPage from "../pages/setting/setting";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import otpVerify from "../pages/auth/otpVerify";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

export const appRoutes = {
    home: "/",
    login: "/login",
    dashboard: "/dashboard",
    forgotPassword: "/forgot-password",
    otpVerify: "/otp-verify",
    resetPassword: "/reset-password",

    // dashboard child routes
    addAdmin: "/dashboard/add-admin",
    viewAdmins: "/dashboard/view-admins",
    addUser: "/dashboard/add-user",
    viewUsers: "/dashboard/view-users",
    addCategory: "/dashboard/categories",
    subCategories: "/dashboard/sub-categories",
    extraCategories: "/dashboard/extra-categories",
    addProduct: "/dashboard/add-product",
    viewProducts: "/dashboard/view-products",
    allOrders: "/dashboard/orders",
    settings: "/dashboard/settings",
    // addProduct: "/dashboard/add-product",
    // viewProducts: "/dashboard/view-products",
    // pendingOrders: "/dashboard/orders/pending",
    // pendingOrders: "/dashboard/orders/pending",
};

export const router = createBrowserRouter([
    {
        path: appRoutes.home,
        Component: App,
        children: [
            {
                path: appRoutes.login,
                Component: LoginPage,
            },
            {
                path: appRoutes.dashboard,
                Component: dashboard,
                children: [
                    { path: 'add-admin', Component: AddAdminPage },
                    { path: 'view-admins', Component: ViewAdminsPage },
                    { path: 'add-user', Component: AddUserPage },
                    { path: 'view-users', Component: ViewUsersPage },
                    { path: 'categories', Component: CategoriesPage },
                    { path: 'sub-categories', Component: SubCategoriesPage },
                    { path: 'extra-categories', Component: ExtraCategoriesPage },
                    { path: 'add-product', Component: AddProductPage },
                    { path: 'view-products', Component: ViewProductsPage },
                    { path: 'orders', Component: OrdersPage },
                    { path: 'settings', Component: SettingsPage },
                ],
            },
            {
                path: appRoutes.forgotPassword,
                Component: ForgotPasswordPage,
            },
            {
                path: appRoutes.otpVerify,
                Component: otpVerify,
            },
            {
                path: appRoutes.resetPassword,
                Component: ResetPasswordPage,
            },
            // future dashboard child route definitions:
            // {
            //     path: appRoutes.addAdmin,
            //     Component: AddAdminPage,
            // },
            // {
            //     path: appRoutes.viewAdmins,
            //     Component: ViewAdminsPage,
            // },
            // {
            //     path: appRoutes.addUser,
            //     Component: AddUserPage,
            // },
            // {
            //     path: appRoutes.viewUsers,
            //     Component: ViewUsersPage,
            // },
            // {
            //     path: appRoutes.addCategory,
            //     Component: AddCategoryPage,
            // },
            // {
            //     path: appRoutes.subCategories,
            //     Component: ViewCategoriesPage,
            // },
            // {
            //     path: appRoutes.extraCategories,
            //     Component: ViewCategoriesPage,
            // },
            // {
            //     path: appRoutes.addProduct,
            //     Component: AddProductPage,
            // },
            // {
            //     path: appRoutes.viewProducts,
            //     Component: ViewProductsPage,
            // },
            // {
            //     path: appRoutes.allOrders,
            //     Component: AllOrdersPage,
            // },
            // {
            //     path: appRoutes.pendingOrders,
            //     Component: PendingOrdersPage,
            // },
            // {
            //     path: appRoutes.settings,
            //     Component: SettingsPage,
            // },
        ],
    },
]);