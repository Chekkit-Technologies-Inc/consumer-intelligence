import { ProductService } from "./ProductService";
import { BaseController } from "../baseController";

/**
 * Product controller
 *
 * @export
 * @class ProductController
 */
export class ProductController extends BaseController {
  // private _productService = new ProductService();
  private _productService = new ProductService();

  // tslint:disable-next-line: max-line-length
  public index = async (userId: any, page: number = 1, per_page: number = 15, sort_by: string = "DESC", sort_by_field: string = "updated_at",
  ) => {
    const products = await this._productService.getProducts(userId, page, per_page, sort_by, sort_by_field);
    return this.sendResponse(products);
  }
  public getAppProducts = async (per_page: number = 15,
    prod_next: string, prod_prev: string,
  ) => {
    const products = await this._productService.getProductsApp(per_page, prod_next, prod_prev);
    return this.sendResponse(products);
  }
  public AllProductREport = async (withUserId: number, per_page: number = 15,
    prod_next: string, prod_prev: string,
  ) => {
    const product_report = await this._productService.AllProductREport(withUserId, per_page, prod_next, prod_prev);
    return this.sendResponse(product_report);
  }
  public getProductBatches = async (productId: any) => {
    const productBatches = await this._productService.getProductBatches(productId);
    return this.sendResponse(productBatches);
  }
  public getAllScanHistory = async () => {
    const scan_history = await this._productService.getAllScanHistory();
    return this.sendResponse(scan_history);
  }
  public getScanHistory = async (user_id: any) => {
    const scan_history = await this._productService.getScanHistory(user_id);
    return this.sendResponse(scan_history);
  }
  public getUserProductBatches = async (userId: any) => {
    const productBatches = await this._productService.getUserProductBatches(userId);
    return this.sendResponse(productBatches);
  }
  public getLineGraphAnalytics = async (userId: any) => {
    const line_graph = await this._productService.getLineGraphAnalytics(userId);
    return this.sendResponse(line_graph);
  }
  public getDataForproducAndBatchesBar = async (userId: any) => {
    const line_graph = await this._productService.getDataForproducAndBatchesBar(userId);
    return this.sendResponse(line_graph);
  }
  public getRewardsPieData = async (userId: any) => {
    const pie_graph = await this._productService.getRewardsPieData(userId);
    return this.sendResponse(pie_graph);
  }
  public getScanHistoryData = async (userId: any) => {
    const ScanHistory = await this._productService.getScanHistoryData(userId);
    return this.sendResponse(ScanHistory);
  }
  public getSurveyQestRespData = async (userId: any) => {
    const SurveyQestRespData = await this._productService.getSurveyQestRespData(userId);
    return this.sendResponse(SurveyQestRespData);
  }
  /**
   * createProduct
   */
  public createProduct = async (user: any, data: any, photo: any) => {
    const product = await this._productService.createProduct(user, data, photo);
    return this.sendResponse(product);
  }
  /**
  * createProductReport
  */
  public createProductReport = async (user: any, data: any, photo: any, productId: number) => {
    const productReport = await this._productService.createProductReport(user, data, photo, productId);
    return this.sendResponse(productReport);
  }
  public createProductReportApp = async (user: any, data: any, subProductId: number) => {
    const productReport = await this._productService.createProductReportApp(user, data, subProductId);
    return this.sendResponse(productReport);
  }
  public returnReportPhoto = async (user: any, photo: any) => {
    const reportImg = {
      product_image: photo.location,
    };
    return this.sendResponse(reportImg);
  }
  /**
 *createSubProduct
 */
  public createSubProduct = async (user: any, data: any) => {
    const product = await this._productService.createSubProduct(user, data);
    return this.sendResponse(product);
  }
  /**
    * generatePin
    */
  public generatePin = async (subProductId: number, data: any) => {
    const generatePin = await this._productService.generatePin(subProductId, data);
    return this.sendResponse(generatePin);
  }

  /**
   * getPinsGenByUser
   */
  public getPinsGenByUser = async (userId: number, user: any) => {
    const getPinsGenByUser = await this._productService.getPinsGenByUser(userId, user);
    return this.sendResponse(getPinsGenByUser);
  }
  public getProductPin = async (productId: number, user: any,
    per_page: number, pin_next: string, pin_prev: string) => {
      console.log(pin_prev)
    const getPinsGenByUser = await this._productService.getProductPin(productId, user, per_page, pin_next, pin_prev);
    return this.sendResponse(getPinsGenByUser);
  }

  public getProductPinForExport = async (productId: number, user: any,
    per_page: number, pin_next: string, pin_prev: string) => {
      console.log(pin_prev)
    const getPinsGenByUser = await this._productService.getProductPinForExport(productId, user, per_page, pin_next, pin_prev);
    return this.sendResponse(getPinsGenByUser);
  }
  public getAllProductPin = async (productId: number, user: any,
    per_page: number, pin_next: string, pin_prev: string) => {
    const getPinsGenByUser = await this._productService.getAllProductPin(productId, user);
    return this.sendResponse(getPinsGenByUser);
  }
  /**
   * deletePost
   */
  public deleteProduct = async (data) => {
    const deleted = await this._productService.deleteProduct(data);
    return this.sendResponse(deleted);
  }

  /**
   * get post
   */
  public getProduct = async (slug: string) => {
    const product = await this._productService.getProduct(slug);
    return this.sendResponse(product);
  }
  /**
       * updateProduct
       */
  public updateProduct = async (slug: any, user: any, data: any) => {
    const update = await this._productService.updateProduct(slug, user, data);
    return this.sendResponse(update);
  }
  public updateSubProduct = async (batch_num: any, user: any, data: any) => {
    const update = await this._productService.updateSubProduct(batch_num, user, data);
    return this.sendResponse(update);
  }


  public getPinExportHistory = async (
    batch_num: number,user: any) => {
      console.log(user)
    const getPinsGenByUser = await this._productService.getPinExportHistory(user,batch_num);
    return this.sendResponse(getPinsGenByUser);
  }

  public updatePinExportHistory = async (user: any, data: any) => {
    const exportHistory = await this._productService.updatePinExportHistory(user, data);
    return this.sendResponse(exportHistory);
  }

  public getScanHistoryByDate = async (productId: any,startDate,endDate) => {
    const ScanHistory = await this._productService.getScanHistoryByDate(productId,startDate,endDate);
    return this.sendResponse(ScanHistory);
  }
  public getProductScanHistory = async (productId: any) => {
    const ScanHistory = await this._productService.getProductScanHistory(productId);

    // console.log('<<<<<ScanHistory>>>>>')
    // console.log(ScanHistory)

    return this.sendResponse(ScanHistory);
  }
}
