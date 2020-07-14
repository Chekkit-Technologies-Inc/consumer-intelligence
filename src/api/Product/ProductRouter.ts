import express from "express";
import { authorize } from "../../middleware";
import { controllerHandler } from "../../shared/controllerHandler";
import { ProductController } from "./ProductController";
// import { ProductValidationSchema, ProductReportValidationSchema, ProductBatchValidationSchema } from './ProductValidation';
import { ProductPhotoUpload, ProductReportPhotoUpload } from '../../middleware/uploads';
import { validation } from "../../middleware/validation";
import {
    ProductValidationSchema, ProductReportValidationSchema,
    ProductBatchValidationSchema
} from "./ProductValidation";

const router = express.Router();
const call = controllerHandler;
const Product = new ProductController();

router.use(authorize);
// router.use(validation(ProductValidationSchema));

router.get("/:slug", call(Product.getProduct, (req, _res, _next) => [req.params.slug]));

router.post("/", [validation(ProductValidationSchema), ProductPhotoUpload.single("photo")],
    call(Product.createProduct, (req, _res, _next) => [req.user, req.body, req.file]));
    
router.post("/upload", [ProductReportPhotoUpload.single("photo")],
    call(Product.returnReportPhoto, (req, res, next) => [req.user, req.file]));

router.post("/createproduct-report/:id", [validation(ProductReportValidationSchema), ProductReportPhotoUpload.single("photo")],
    call(Product.createProductReport, (req, _res, _next) => [req.user, req.body, req.file, req.params.id]));

router.post("/newproduct-report/:id", [validation(ProductReportValidationSchema)],
    call(Product.createProductReportApp, (req, _res, _next) => [req.user, req.body, req.params.id]));
router.delete("/:id",
    call(Product.deleteProduct, (req, _res, _next) => [{ productId: req.params.id, user: req.user }]));

router.get("/all_products/:id", call(Product.index, (req, _res, _next) => [req.params.id]));

router.get("/product-reports/:id", call(Product.AllProductREport, (req, _res, _next) => [req.params.id]));

router.get("/products-app/:id", call(Product.getAppProducts, (req, _res, _next) => [req.params.id, req.query.per_page,
req.query.prod_next,
req.query.prod_prev]));

router.get("/all_user_product_batches/:id", call(Product.getUserProductBatches, (req, _res, _next) => [req.params.id]));

router.get("/all_product_batches/:id", call(Product.getProductBatches, (req, _res, _next) => [req.params.id]));

router.get("/all-scan-history/stats/", call(Product.getAllScanHistory, (req, _res, _next) => [req.params.id]));

router.get("/all-scan-history/:id", call(Product.getScanHistory, (req, _res, _next) => [req.params.id]));

router.put("/update-product/:slug", [validation(ProductValidationSchema)],
    call(Product.updateProduct, (req, _res, _next) => [req.params.slug, req.user, req.body]));
    
router.post("/generate-pin/:id",
    call(Product.generatePin, (req, _res, _next) => [req.params.id, req.body]));

router.get("/get-userpin-generated/:id",
    call(Product.getPinsGenByUser, (req, _res, _next) => [req.params.id, req.product]));

router.get("/get-product-pins/:id",
    call(Product.getProductPin, (req, _res, _next) => [req.params.id, req.user, req.query.per_page,
    req.query.pin_next,
    req.query.pin_prev]));

router.get("/get-product-pins-for-export/:id",
    call(Product.getProductPinForExport, (req, _res, _next) => [req.params.id, req.user, req.query.per_page,
    req.query.pin_next,
    req.query.pin_prev]));

router.get("/get-all-product-pins/:id",
    call(Product.getAllProductPin, (req, _res, _next) => [req.params.id, req.user]));

router.post("/sub-products/", [validation(ProductBatchValidationSchema)],
    call(Product.createSubProduct, (req, _res, _next) => [req.user, req.body]));

router.put("/update-sub-product/:batch_num", [validation(ProductBatchValidationSchema)],
    call(Product.updateSubProduct, (req, _res, _next) => [req.params.batch_num, req.user, req.body]));

router.get("/get-user-pin-export-history/:batch_num",
    call(Product.getPinExportHistory, (req, _res, _next) => [req.params.batch_num,req.user]));

router.post("/update-pin-export-history/:id",
    call(Product.updatePinExportHistory, (req, _res, _next) => [req.user, req.body]));

// analytics api
router.get("/line-graph/:id", [validation(ProductBatchValidationSchema)],
    call(Product.getLineGraphAnalytics, (req, _res, _next) => [req.params.id]));

router.get("/pb-line-graph/:id", [validation(ProductBatchValidationSchema)],
    call(Product.getDataForproducAndBatchesBar, (req, _res, _next) => [req.params.id]));

router.get("/rewards-piegraph/:id", [validation(ProductBatchValidationSchema)],
    call(Product.getRewardsPieData, (req, _res, _next) => [req.params.id]));

router.get("/scanhist-graph/:id", [validation(ProductBatchValidationSchema)],
    call(Product.getScanHistoryData, (req, _res, _next) => [req.params.id]));

router.get("/surveyqustresp-graph/:id", [validation(ProductBatchValidationSchema)],
    call(Product.getSurveyQestRespData, (req, _res, _next) => [req.params.id]));

router.get("/get-scan-statistics-by-date/:id/:startDate/:endDate",
    call(Product.getScanHistoryByDate, (req, _res, _next) => [req.params.id,req.params.startDate,req.params.endDate, req.product]));

router.get("/get-product-scan-statistics/:id",
    call(Product.getProductScanHistory, (req, _res, _next) => [req.params.id,req.params.startDate,req.params.endDate, req.product]));

export const ProductRouter = router;
