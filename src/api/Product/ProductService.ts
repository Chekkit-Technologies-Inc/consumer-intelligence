import crypto from "crypto";
import slugify from "slugify";
// const stream = require('stream');

import { AppError } from "../../utils/app-error";
import { UserModel, ActivitiesCountModel } from "../User";
import { ProductModel } from "./ProductModel";
import { GeneratePinModel, PinExportHistoryModel } from ".";
import QRCode from "qrcode";
import { SubProductModel } from "./SubProductModel";
import { UssdBaseController } from "../ussdResponseController";
import { ProductReportModel } from "./ProductReportModel";
import { DB } from "../../shared/database";
// import { MYSQL2DB } from "../../shared/database";
// import { MYSQLDB } from "../../shared/database";
import { ScanHistoryModel } from "./ScanHistoryModel";
import { Op } from "sequelize";
import Sequelize from "sequelize";
import { RewardModel } from "../SurveyReward/RewardModel";
import { LoyaltyPointsModel } from "../Survey/LoyaltyPointsModel";
import { RedemptionModel, SurveyModel } from "../Survey";
import { SubscriptionModel } from "../Subscription/subscriptionModel";
import { ResourcesModel } from "../Subscription/cipayresourcesModel";
import moment from "moment";
const NodeGeocoder = require('node-geocoder');

export class ProductService extends UssdBaseController {

  public obj_insert: any = [];
  private VALUE_YES: number = 1;
  geocodeOptions = {
    provider: 'google',
   
    // Optional depending on the providers
    // fetch: customFetchImplementation,
    apiKey: 'AIzaSyDP6cGriBm9-_8g42-j6DiI1BEl3WHdOhk', // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
  };

  /**
   * Create new Product content
   * @param {Object} data.ProductData
   * @param {string} data.ProductData.product_name the Product title
   * @param {string} data.ProductData.product_description the Product content
   * @param {number} data.ProductData.userId the Product author id
   *
   * @returns {[Promise<any> | null]} saved Product data
   */
  
  public createProduct = async (user: any, data: any, photo: any) => {
    data.slug = await this.createSlug(data.product_name);
    data.product_image = photo.location;
    let dat_objct = {
      product_description: data.product_description,
      product_name: data.product_name,
      product_image: data.product_image,
      producer_name: data.producer_name,
      slug: data.slug,
      batch_num: data.batch_num,
      barcode_num: data.barcode_num,
      age_range: data.age_range,
      fda_number: data.FDA_number,
      id_range: data.id_range,
      production_date: data.production_date,
      expiry_date: data.expiry_date,
      product_category: data.product_category,
      surveyId: data.surveyId,
      reward_id: data.reward_id,
    };

    console.log(dat_objct);
    const saved = await ProductModel.create(dat_objct);
    // return;

    if (saved && user.addProduct(saved)) {
      let all_count = await ActivitiesCountModel.findOne({ where: { userId: user.id } });
      // // associations have been set
      if (all_count) {
        const products_count: number = all_count.dataValues.products_count + 1;
        await ActivitiesCountModel.update({ products_count }, { where: { userId: user.id } });
      } else {
        await ActivitiesCountModel.create({ userId: user.id, products_count: 1 });
      }
      const sub_prdct = this.createbatch(user, saved, data);
      return sub_prdct;
    }
    throw new AppError("Could not create Product.");
  }

  // create product report from web 
  public createProductReport = async (user: any, data: any, photo: any, productId: any) => {
    data.slug = await this.createSlug(data.product_name);
    data.product_image = photo.location;
    let dat_objct = {
      product_user_exprnce: data.product_user_exprnce,
      product_name: data.product_name,
      product_image: data.product_image,
      slug: data.slug,
      product_store_address: data.product_store_address,
      productId,
    };
    const saved = await ProductReportModel.create(dat_objct);
    if (saved && user.setProductReport(saved)) {
      let all_count = await ActivitiesCountModel.findOne({ where: { userId: user.id } });
      // // associations have been set
      if (all_count) {
        const products_count: number = all_count.dataValues.products_count + 1;
        await ActivitiesCountModel.update({ products_count }, { where: { userId: user.id } });
      } else {
        await ActivitiesCountModel.create({ userId: user.id, products_count: 1 });
      }
      return saved;
    }
    throw new AppError("Could not create Product.");
  }

  // create product report from android 
  public createProductReportApp = async (user: any, data: any, subProductId: any) => {
    data.slug = await this.createSlug(data.product_name);
    let sub_product = await SubProductModel.findOne({ where: { id: subProductId } });
    let dat_objct = {
      product_user_exprnce: data.product_user_exprnce,
      product_name: data.product_name,
      product_image: data.product_image,
      slug: data.slug,
      product_store_address: data.product_store_address,
      subProductId,
      productId: sub_product.productId,
      withUserId: sub_product.userId,
    };
    const saved = await ProductReportModel.create(dat_objct);
    if (saved && user.setProductReport(saved)) {
      let all_count = await ActivitiesCountModel.findOne({ where: { userId: user.id } });
      // // associations have been set
      if (all_count) {
        const products_count: number = all_count.dataValues.products_count + 1;
        await ActivitiesCountModel.update({ products_count }, { where: { userId: user.id } });
      } else {
        await ActivitiesCountModel.create({ userId: user.id, products_count: 1 });
      }
      return saved;
    }
    throw new AppError("Could not create Product report.");
  }
  public createSubProduct = async (user: any, data: any) => {
    let dat_objct = {
      productId: data.productId,
      product_name: data.product_name,
      batch_num: this.generateUniqueIdentifier(4),
      production_date: data.production_date,
      expiry_date: data.expiry_date,
      surveyId: data.survey_id,
      rewardId: data.reward_id,
    };
    const saved = await SubProductModel.create(dat_objct);
    if (saved && user.addSubProduct(saved)) {
      return saved;
    }
    throw new AppError("Could not create Product batch.");
  }
  public createbatch = async (user: any, data: any, prodData: any) => {
    let dat_objct = {
      productId: data.id,
      product_name: data.product_name,
      batch_num: this.generateUniqueIdentifier(4),
      production_date: data.production_date,
      expiry_date: data.expiry_date,
      surveyId: prodData.survey_id,
      rewardId: prodData.reward_id,
    };
    const saved = await SubProductModel.create(dat_objct);
    if (saved && user.addSubProduct(saved)) {
      return saved;
    }
    throw new AppError("Could not create Product batch.");
  }
  public generatePin = async (subProductId, data: any) => {
    let save_obj = await this.checkDuplicates(
      this.myUniqueID, data.pin_quantity,
      { pin_type: data.pin_type, subProductId }); // Math.pow(10, 4) == 10'000 times

    // get product batch
    const productData = await SubProductModel.findOne({
      where: { id: subProductId },
    });

    // calculate fee user will  pay
    const user_sub = await SubscriptionModel.findOne({
      where: { userId: productData.userId },
    });

    // get costs
    const sub_rescs = await ResourcesModel.findOne();

    if (productData) {
      // let saved = await GeneratePinModel.bulkCreate(save_obj);
      // delete this.obj_insert;
      if (save_obj) {
        // update number qr generated for batch
        await SubProductModel.update({
          total_generated_code: (Number(productData.total_generated_code) + Number(data.pin_quantity)),
        }, { where: { id: subProductId } });

        // update user balance
        await SubscriptionModel.update({
          gen_pins_balance: (Number(user_sub.gen_pins_balance) + (Number(data.pin_quantity) * (sub_rescs.pin_cost))),
          gen_pins_status: 0,
        },
          { where: { userId: productData.userId } });

        let all_count = await ActivitiesCountModel.findOne({ where: { userId: productData.userId } });
        // // associations have been set
        if (all_count) {
          if (data.pin_type == "agent") {
            const product_agents_count: number = all_count.dataValues.product_agents_count + data.pin_quantity;
            await ActivitiesCountModel.update({ product_agents_count }, { where: { userId: productData.userId } });
          } else {
            const product_pins_count: number = all_count.dataValues.product_pins_count + data.pin_quantity;
            await ActivitiesCountModel.update({ product_pins_count }, { where: { userId: productData.userId } });
          }
        } else {
          if (data.pin_type == "agent") {
            await ActivitiesCountModel.create({ userId: productData.userId, product_agents_count: data.pin_quantity });
          } else {
            await ActivitiesCountModel.create({ userId: productData.userId, product_pins_count: data.pin_quantity });
          }

        }
        // return batch to api
        let newsub_product = await SubProductModel.findOne({
          where: { id: subProductId },
        });
        return newsub_product;
      }
      throw new AppError("Could not generate Product pins.");
    }
    throw new AppError("Could not generate Product pins.");
  }

  /**
   * Deletes single product of current user
   *
   * @param {Object} data
   * @param {Object} data.user the current user
   * @param {number} data.productId the product to be deleted
   *
   * @returns {[String | null]}
   */
  public deleteProduct = async (data: any) => {
    let product = await ProductModel.findOne({ where: { id: data.productId } });
    let user = data.user;

    if (product) {
      const canDelete = (await user.hasProduct(product));
      if (canDelete) {
        const softDeleted = await ProductModel.destroy({
          where: { id: data.productId },
        });
        if (softDeleted) {
          return "Product deleted";
        } else {
          throw new AppError("You cannot perform that action", null, 403);
        }
      } else {
        return "You cannot perform that action";
      }
    }
    throw new AppError("Product not found", null, 403);
  }
  public updateSubProduct = async (batch_num: any, user: any, data: any) => {
    let sub_product = await SubProductModel.findOne({ where: { batch_num } });
    if (sub_product && user.hasSubProduct(sub_product)) {
      if (user.id != sub_product.userId) {
        throw new AppError("You are not allowed to perform that operation.", null, 401);
      }
      let dat_objct = {
        productId: data.productId,
        product_name: data.product_name,
        production_date: data.production_date,
        expiry_date: data.expiry_date,
        surveyId: data.survey_id,
        rewardId: data.reward_id,
      };
      let updated = SubProductModel.update(dat_objct, { where: { batch_num } });
      if (updated) {
        let product = await ProductModel.findOne({ where: { id: sub_product.productId } });
        return product;
      }

    }

    throw new AppError("Product batch not found.", null, 401);
  }
  public updateProduct = async (slug: any, user: any, data: any) => {
    let product = await ProductModel.findOne({ where: { slug } });
    if (product && user.hasProduct(product)) {
      if (user.id != product.userId) {
        throw new AppError("You are not allowed to perform that operation.", null, 401);
      }
      // let dat_objct = {
      //   productId: data.productId,
      //   product_name: data.product_name,
      //   production_date: data.production_date,
      //   expiry_date: data.expiry_date,
      //   surveyId: data.survey_id,
      //   rewardId: data.reward_id,
      // };
      let updated = ProductModel.update(data, { where: { slug } });
      if (updated) {
        let product = await ProductModel.findOne({ where: { slug } });
        return product;
      }

    }

    throw new AppError("Product batch not found.", null, 401);
  }
  /**
   * Gets product details using slug
   * @param {string} slug the product slug
   */
  public getProduct = async (slug: string) => {
    let product = await ProductModel.findOne({
      where: { slug, is_visible: this.VALUE_YES },
    });
    if (product) {
      const updated = await this.viewProduct(product);
      return updated;
    }
    return "Product not found";
  }

  /**
   * Get multiple products
   * @param {number} page current page number
   * @param {number} per_page number of results per page
   * @param {string} sort_by order to be used when sorting
   * @param {string} sort_by_field field to be used with `sort_by`
   */
  public getProducts = async (userId: any, page: number, per_page: number = 15, sort_by: string, sort_by_field: string,
  ) => {
    const order: any = [[sort_by_field, sort_by]];
    const offset: number = this.getOffsetValue(page, per_page);
    const products = await ProductModel.findAll({
      where: { userId, is_visible: this.VALUE_YES },
      order,
      offset,
    });
    const productsCount = await ProductModel.count({
      where: { userId, is_visible: this.VALUE_YES },
    });
    
    for (let index = 0; index < products.length; index++) {
      const productId = products[index].id;
      let survey = await SurveyModel.findOne({
        where: { productId }, attributes: {
          exclude: [
            "updated_at", "deleted_at",
          ],
        },
      raw: true,
      });
      if(survey){
        // products[index].surveyId = survey.id;   
        products[index].setDataValue('surveyId', survey.id);
   
        // console.log(products[index])
        console.log(survey.id)
      }
    }

    if (products) {
      const metadata = this.buildMetaData(products, page, productsCount);
      return {
        products,
        metadata,
      };
    }
    throw new AppError("No product found", null, 401);
  }
  public getProductsApp = async (per_page: number = 15,
    prod_next: string,
    prod_prev: string) => {
    const limit: number = Number(per_page);
    let posts = await (<any>ProductModel).paginate({
      limit,
      desc: true,
      before: prod_prev,
      after: prod_next,
    });

    if (posts) {
      const totalProducts = await ProductModel.count();
      return {
        products: posts.results,
        cursors: posts.cursors,
        totalProducts,
      };
    }
    throw new AppError("No product found", null, 401);
  }
  public AllProductREport = async (withUserId, per_page: number = 15,
    prod_next: string,
    prod_prev: string) => {
    let reports = await ProductReportModel.findAll({
      where: {
        withUserId, is_visible: this.VALUE_YES,
      },
      include: [
        {
          model: UserModel,
          attributes: {
            exclude: [
              "email",
              "password",
              "email_verification_code",
              "reset_password_code",
              "refresh_token",
              "auth_key",
              "updated_at",
              "deleted_at",
              "userId"],
          },
        },
      ],
    });

    if (reports) {
      const totalReports = await ProductReportModel.count({
        where: {
          withUserId, is_visible: this.VALUE_YES,
        },
      });
      return {
        reports,
        totalReports,
      };
    }
    throw new AppError("No product reports found", null, 401);
  }
  public getProductBatches = async (productId: any) => {
    const productBatches = await SubProductModel.findAll({
      where: { productId, is_visible: this.VALUE_YES },
    });
    const productsCount = await SubProductModel.count({
      where: { productId, is_visible: this.VALUE_YES },
    });

    if (productBatches) {
      return {
        productBatches, productsCount,
      };
    }
    throw new AppError("No product batches found", null, 401);
  }
  public getAllScanHistory = async () => {
    const scan_history = await ScanHistoryModel.findAll({
      include: [
        {
          model: ProductModel,
          attributes: {
            exclude: [
              "deleted_at",
            ],
          },
        },
        {
          model: SubProductModel,
          attributes: {
            exclude: [
              "deleted_at",
            ],
          },
        },
        {
          model: GeneratePinModel,
          attributes: {
            exclude: [
              "deleted_at",
            ],
          },
        },
      ],
    });
    if (scan_history) {
      return scan_history;
    }
    throw new AppError("No scan histories found", null, 401);
  }
  
  public getScanHistory = async (user_id: any) => {
    const scan_history = await ScanHistoryModel.findAll({
      where: { user_id },
      include: [
        {
          model: ProductModel,
          attributes: {
            exclude: [
              "deleted_at",
            ],
          },
        },
        {
          model: SubProductModel,
          attributes: {
            exclude: [
              "deleted_at",
            ],
          },
        },
      ],
    });
    if (scan_history) {
      return scan_history;
    }
    throw new AppError("No scan histories found", null, 401);
  }
  public getUserProductBatches = async (userId: any) => {
    const UserproductBatches = await SubProductModel.findAll({
      where: { userId, is_visible: this.VALUE_YES },
      include: [
        {
          model: ProductModel,
          attributes: {
            exclude: [
              "deleted_at",
            ],
          },
        },
      ],
    });
    const productsCount = await SubProductModel.count({
      where: { userId, is_visible: this.VALUE_YES },
    });

    if (UserproductBatches) {
      return {
        UserproductBatches, productsCount,
      };
    }
    throw new AppError("No product batches found", null, 401);
  }
  public async getPinsGenByUser(userId: number, user: any) {
    let UserProduct = await ProductModel.findAll({
      where: { userId, is_visible: this.VALUE_YES },
    });
    if (UserProduct) {
      let getPinsGenByUser: any = [];
      for (let index = 0; index < UserProduct.length; index++) {
        const productId = UserProduct[index].id;
        let getPins = await GeneratePinModel.findAll({
          where: { productId }, attributes: {
            exclude: [
              "updated_at", "deleted_at",
            ],
          },
        });
        if (getPins) {
          getPinsGenByUser.push(...getPins);
        }
      }
      return { UserProduct, getPinsGenByUser };
    } else {
      throw new AppError("No product Pin found", null, 401);
    }
  }
  public async getProductPin(subProductId: number, user: any, per_page: number = 500,
    pin_next: string, pin_prev: string) {
    const limit: number = Number(per_page);
    let ProductPin = await (<any>GeneratePinModel).paginate({
      where: { subProductId },
      limit,
      before: Number(pin_prev),
      after: pin_next,
      attributes: {
        exclude: [
          "updated_at", "deleted_at",
        ],
      },
    });
    if (ProductPin) {
      const totalPins = await GeneratePinModel.count();
      ProductPin.results = await Promise.all(ProductPin.results.map(async (pins) => {
        pins = pins.toJSON();
        pins.pin_qrcode = await this.generateQR(pins.pin_value);
        return pins;
      }));
      return {
        pins: ProductPin.results,
        cursors: ProductPin.cursors,
        totalPins,
      };
    }
    throw new AppError("No product Pin found", null, 401);
  }
  public async getProductPinForExport(subProductId: number, user: any, per_page: number = 500,
    pin_next: string, pin_prev: string) {
      const offset = Number(pin_prev);
      // var Readable = stream.Readable;
      // var i = 4;
      // var s = new Readable({
      //     async read(size) {
      //         const result = await DB.query(
      //             `SELECT * FROM checkkit_survey.generated_pins` + ` LIMIT 1000000 OFFSET ${(i - 1) * 1000000}`, { type:  (<any>DB).QueryTypes.SELECT });
      //         this.push(JSON.stringify(result));
      //         i++;
      //         if (i === 5) {
      //             this.push(null);
      //         }
      //         console.log(result);

      //     }
      // });
      // let res = [];
      // s.pipe(res);
      /*
     var s = await MYSQLDB.query('SELECT * FROM checkkit_survey.generated_pins LIMIT 1000000')
      .stream({highWaterMark:5})
      .pipe(new stream.Transform({
        objectMode: true,
        transform: function (row, encoding, callback) {
          console.log(row)
          
          // Do something with the row of data
          return row;
          callback();
        }
      }))
      .on('result', function(row) {
        // Pausing the connnection is useful if your processing involves I/O
        s.pause();
        console.log(row)

        // processRow(row, function() {
        //   s.resume();
        // });
      })
      .on('finish', function() {
        // DB.end();
      });
*/
      // console.log(s);
      // return s;
    const limit: number = Number(per_page);
    let ProductPin = await (<any>GeneratePinModel).paginate({
      offset:offset,
      where: { subProductId },
      limit,
      // before: Number(pin_prev),
      // after: pin_next,
      attributes: {
        exclude: [
          "updated_at", "deleted_at",
        ],
      },
    });
    if (ProductPin) {
      const totalPins = await GeneratePinModel.count();
      return {
        pins: ProductPin.results,
        totalPins,
      };
    }
    throw new AppError("No product Pin found", null, 401);
  }
  public async getAllProductPin(subProductId: number, user: any) {
    let ProductPin = await (<any>GeneratePinModel).paginate({
      where: { subProductId },
      attributes: {
        exclude: [
          "updated_at", "deleted_at",
        ],
      },
    });
    if (ProductPin) {
      const totalPins = await GeneratePinModel.count();
      ProductPin.results = await Promise.all(ProductPin.results.map(async (pins) => {
        pins = pins.toJSON();
        pins.pin_qrcode = await this.generateQR(pins.pin_value);
        return pins;
      }));
      return {
        pins: ProductPin.results,
        cursors: ProductPin.cursors,
        totalPins,
      };
    }
    throw new AppError("No product Pin found", null, 401);
  }

  public updatePinExportHistory = async (user: any, data: any) => {
    // console.log('>>>><<<<<')
    console.log(data)

    let dat_objct = {
      startIndex: String(data.start_index),
      quantity: String(data.quantity),
      endIndex: String(data.end_index),
      user_id: String(user.id),
      sub_product_id: data.sub_product_id,
    };

    const saved = await PinExportHistoryModel.create(dat_objct);
    if (saved) {
      return saved;
    }
    throw new AppError("Could not save history.");
  }
  public getPinExportHistory = async (user: any,batch_num) => {
    // DB.queryNodeStream
    let product = await PinExportHistoryModel.findOne({
      where: { user_id:user.id,sub_product_id:batch_num },
      order: [
        ['id', 'DESC'],
      ],
    });
    if (product) {
      return product;
    }
    return "Product not found";
  }
  public verifyPin = async (verifyData: any) => {
    // convert input to number
    const pin_value = Number(verifyData.pin_value);

    // check if pin exist
    let pin_check = await GeneratePinModel.findOne({
      where: { pin_value },
    });
    console.log(pin_check)
    
    if (pin_check) {
      // prepare scan data for history
      let scanData = {
        scan_channel: verifyData.scan_channel,
        scan_status: "",
        productId: "",
        subProductId: pin_check.subProductId,
        user_id: String(verifyData.user_id),
        scan_pin: verifyData.pin_value,
        scan_location: verifyData.scan_location,
      };
      // check for product batch
      const product = await SubProductModel.findOne({
        where: { id: pin_check.subProductId },
        include: [
          {
            model: UserModel,
            attributes: {
              exclude: [
                "email",
                "phone_number",
                "password",
                "email_verification_code",
                "reset_password_code",
                "refresh_token",
                "auth_key",
                "updated_at",
                "deleted_at",
                "userId"],
            },
          },
          {
            model: ProductModel,
            attributes: {
              include: [
                "product_image",
              ],
            },
          },
        ],
      });

      // check if pin has been used 
      if (pin_check.pin_status === 1) {

        const scan_history = await ScanHistoryModel.findOne({ where: { scan_pin: verifyData.pin_value } });

        if (scan_history) {
          // check if current user has used pin
          if (Number(scan_history.user_id) == Number(verifyData.user_id)) {
            // if same user has used the pin, increment status to 2 
            const updated = await GeneratePinModel.update({ pin_status: Number(pin_check.pin_status) + 1 }, {
              where: { pin_value },
            });
            if (updated) {
              const resces = await ResourcesModel.findOne();
              await this.deductAccountBalance(product.userId, resces.qr_cost);
              return { product, pin_check };
            }
          } else {
            return { product, pin_check };
            // return await {
            //   status: false, data: "The pin has been used by another user," +
            //     "you are not allowed to claim the reward. Thank you!",
            // };
          }
        } else {
          // pin_check.pin_status = 0;
          return { product, pin_check };
          // return await {
          //   status: false, data: "The pin has been used by another user," +
          //     "you are not allowed to claim the reward. Thank you!",
          // };
        }
        throw new AppError("Failed to update Pin status, try again..", null, 401);
      } else if (pin_check.pin_status === 2) {
        return { product, pin_check };
        // return this.sendUssdResponse(pin_check, "The pin has been used to verify and claim reward on a product.", 22);
      } else {
        const updated = await GeneratePinModel.update({ pin_status: Number(pin_check.pin_status) + 1 }, {
          where: { pin_value },
        });
        if (updated) {
          const resces = await ResourcesModel.findOne();
          await this.deductAccountBalance(product.userId, resces.qr_cost);
          scanData.scan_status = "verified OK";
          scanData.productId = product.productId;
          await ScanHistoryModel.create(scanData);
          const customStatus = 11;

          return { product, pin_check, customStatus };
        }
        throw new AppError("Failed to update Pin status, try again..", null, 401);
      }
    }
    throw new AppError("No product Pin found", null, 401);
  }
  public verifyPinUssd = async (verifyData: any) => {
    const pin_value = verifyData.pin_value;
    let pin_check = await GeneratePinModel.findOne({
      where: { pin_value },
    });
    // console.log("pin checked", pin_check);
    if (pin_check) {
      let scanData = {
        scan_channel: verifyData.scan_channel,
        scan_pin: verifyData.pin_value,
        scan_status: "",
        productId: "",
        user_id: verifyData.user_id,
        session_id: verifyData.session_id,
        subProductId: pin_check.subProductId,
      };
      const product = await SubProductModel.findOne({
        where: { id: pin_check.subProductId },
      });
      const prodValue = await ProductModel.findOne({
        where: { id: product.productId },
      });
      // console.log("pin prodValue", prodValue);
      if (pin_check.pin_status === 1) {
        const scan_history = await ScanHistoryModel.findOne({ where: { scan_pin: verifyData.pin_value } });
        if (scan_history) {
          if (scan_history.user_id == verifyData.user_id) {
            const updated = await GeneratePinModel.update({ pin_status: Number(pin_check.pin_status) + 1 }, {
              where: { pin_value },
            });
            if (updated) {
              const resces = await ResourcesModel.findOne();
              await this.deductAccountBalance(product.userId, resces.ussd_cost);
              return await { status: true, product, product_name: prodValue.product_name };
            }
          } else {
            return await {
              status: false, data: "The pin has been used by another user," +
                "you are not allowed to claim the reward. Thank you!",
            };
          }
        } else {
          const updated = await GeneratePinModel.update({ pin_status: Number(pin_check.pin_status) + 1 }, {
            where: { pin_value },
          });
          if (updated) {
            return await { status: true, product, product_name: prodValue.product_name };
          }
        }
        return await { status: false, data: "Failed to update Pin status, try again.." };
      } else if (pin_check.pin_status === 2) {
        return await { status: false, data: "The pin has been used to verify and claimed reward on a product." };
      } else {
        const updated = await GeneratePinModel.update({ pin_status: Number(pin_check.pin_status) + 1 }, {
          where: { pin_value },
        });
        if (updated) {
          const resces = await ResourcesModel.findOne();
          await this.deductAccountBalance(product.userId, resces.ussd_cost);
          scanData.scan_status = "verified OK";
          scanData.productId = product.productId;
          await ScanHistoryModel.create(scanData);
          return await { status: true, product, product_name: prodValue.product_name };
        }
        return await { status: false, data: "Failed to update Pin status, try again.." };
      }
    }
    return await { status: false, data: "Invalid product pin " };
  }
  public getQuestions = async (pin_value: any) => {
    let pin_check = await GeneratePinModel.findOne({
      where: { pin_value },
    });
    if (pin_check) {
      let sub_product = await SubProductModel.findOne({
        where: { id: pin_check.subProductId },
      });
      if (sub_product) {
        let question = await DB.query(`SELECT * from surveys_questions WHERE survey_id =
        ${sub_product.surveyId}`, {
          type: (<any>DB).QueryTypes.SELECT,
        });
        if (question) {
          return await { status: true, question };
        }
        return await { status: false, data: "No question for the survey." };
      }
      return await { status: false, data: "Failed to load questions" };

    }
    return await { status: false, data: "Invalid product pin " };
  }
  public getNoLabelQuestions = async (clientCode: any) => {
    let clientId = 0;
    if(clientCode == '01'){
      clientId = 2;
    }

    let survey_check = await SurveyModel.findOne({
      where: { user_id: clientId , type: 2},
      // where: { user_id: clientId, type: 2 },
    });

    console.log(survey_check.id)
    if (clientId) {
      // let sub_product = await SubProductModel.findOne({
      //   where: { id: pin_check.subProductId },
      // });
      if (survey_check) {
        let question = await DB.query(`SELECT * from surveys_questions WHERE survey_id =
        ${survey_check.id}`, {
          type: (<any>DB).QueryTypes.SELECT,
        });
        if (question) {
          return await { status: true, question };
        }
        return await { status: false, data: "No question for the survey." };
      }
      return await { status: false, data: "Failed to load questions" };

    }
    return await { status: false, data: "Invalid product pin " };
  }
  public getQuestionsByType = async (clientCode: any,type) => {
    // let clientId = 0;
    // if(clientCode == '01'){
    //   clientId = 2;
    // }

    let survey_check = await SurveyModel.findOne({
      where: {  type: type,active_survey:'1'},
      // where: { user_id: clientId, type: 2 },
    });

    // console.log(survey_check.id)
      // let sub_product = await SubProductModel.findOne({
      //   where: { id: pin_check.subProductId },
      // });
      if (survey_check) {
        // let question = await DB.query(`SELECT * from surveys_questions WHERE survey_id =
        // ${survey_check.id}`, {
        //   type: (<any>DB).QueryTypes.SELECT,
        // });
        let question = await DB.query(`SELECT * FROM checkkit_survey.surveys_questions WHERE survey_id = ${survey_check.id} ORDER BY RAND() `, {
          type: (<any>DB).QueryTypes.SELECT,
        });

        if (question) {
          return await { status: true, question };
        }
        return await { status: false, data: "No question for the survey." };
      }
      return await { status: false, data: "Failed to load questions" };

    return await { status: false, data: "Invalid product pin " };
  }
  // convert points to reward
  public processReward = async (pin_value: any) => {
    let pin_check = await GeneratePinModel.findOne({
      where: { pin_value },
    });
    if (pin_check) {
      let sub_product = await SubProductModel.findOne({
        where: { id: pin_check.subProductId },
      });
      if (sub_product) {
        let reward = await DB.query(`SELECT * from survey_rewards WHERE id = ${sub_product.rewardId}`, {
          type: (<any>DB).QueryTypes.SELECT,
        });
        if (reward) {
          return reward;
        }
        return false;
      }
      return false;
    }
    return false;
  }
  public updateScanHistory = async (scanData) => {
    console.log("scanData", scanData);
    const updated = await ScanHistoryModel.update(scanData, {
      where: { [Op.and]: [{ user_id: scanData.user_id }, { session_id: scanData.session_id }] },
    });
    if (updated) {
      await GeneratePinModel.update({ pin_status: 2 }, {
        where: { pin_value: scanData.pin_value },
      });
      return updated;
    }
    return false;
  }
  public deductAirtimeReward = async (userId: number, amount: number) => {
    console.log("yes", userId);
    let sub_details = await SubscriptionModel.findOne({ where: { userId } });
    if (sub_details) {
      let rewards_balance = String(Number(sub_details.rewards_balance) - amount);
      const update = await SubscriptionModel.update({ rewards_balance }, { where: { userId } });
      if (update) {
        return true;
      }
      return false;
    }
    throw new AppError("No Subscription found", null, 401);
  }
  public deductAccountBalance = async (userId: number, amount: number) => {
    let sub_details = await SubscriptionModel.findOne({ where: { userId } });
    if (sub_details) {
      let account_balance = String(Number(sub_details.account_balance) - amount);
      const update = await SubscriptionModel.update({ account_balance }, { where: { userId } });
      if (update) {
        return true;
      }
      return false;
    }
    throw new AppError("No Subscription found", null, 401);
  }
  public returnScanDefault = async (pin_value) => {
    let updated = await GeneratePinModel.update({ pin_status: 0 }, {
      where: { pin_value },
    });
    if (updated) {
      return true;
    }
    return false;
  }
  public getLineGraphAnalytics = async (userId) => {
    let all_week_data = await DB.query(`SELECT CONCAT(YEAR(created_at),
    '/',WEEK(created_at)) AS week_name, COUNT(*) AS value
    FROM generated_pins WHERE sub_product_id IN (SELECT id FROM sub_products WHERE user_id=${userId})
    GROUP BY week_name ORDER BY YEAR(created_at) ASC,WEEK(created_at) ASC`, {
      type: (<any>DB).QueryTypes.SELECT,
    });
    let valid_week_data = await DB.query(`SELECT CONCAT(YEAR(created_at),
     '/',WEEK(created_at)) AS week_name, COUNT(*) AS value
    FROM generated_pins WHERE pin_status=0 AND sub_product_id IN (SELECT id FROM sub_products WHERE user_id=${userId})
    GROUP BY week_name ORDER BY YEAR(created_at) ASC,WEEK(created_at) ASC`, {
      type: (<any>DB).QueryTypes.SELECT,
    });
    let invalid_all_week_data = await DB.query(`SELECT CONCAT(YEAR(created_at),
     '/',WEEK(created_at)) AS week_name, COUNT(*) AS value
    FROM generated_pins WHERE pin_status IN (1,2) AND sub_product_id IN
    (SELECT id FROM sub_products WHERE user_id=${userId})
    GROUP BY week_name ORDER BY YEAR(created_at) ASC,WEEK(created_at) ASC`, {
      type: (<any>DB).QueryTypes.SELECT,
    });

    let all_month_data = await DB.query(`SELECT CONCAT(YEAR(created_at),'/',MONTH(created_at)) AS month_name,
    COUNT(*) AS value FROM generated_pins WHERE sub_product_id IN (SELECT id FROM sub_products WHERE user_id=${userId})
    GROUP BY month_name ORDER BY YEAR(created_at) ASC,MONTH(created_at) ASC`, {
      type: (<any>DB).QueryTypes.SELECT,
    });
    let valid_all_month_data = await DB.query(`SELECT CONCAT(YEAR(created_at),'/',MONTH(created_at)) AS month_name,
     COUNT(*) AS value FROM generated_pins WHERE pin_status=0
     AND sub_product_id IN (SELECT id FROM sub_products WHERE user_id=${userId})
    GROUP BY month_name ORDER BY YEAR(created_at) ASC,MONTH(created_at) ASC`, {
      type: (<any>DB).QueryTypes.SELECT,
    });
    let invalid_all_month_data = await DB.query(`SELECT CONCAT(YEAR(created_at),
    '/',MONTH(created_at)) AS month_name, COUNT(*) AS value FROM generated_pins WHERE pin_status IN(1,2)
    AND sub_product_id IN (SELECT id FROM sub_products WHERE user_id=${userId})
    GROUP BY month_name ORDER BY YEAR(updated_at) ASC,MONTH(created_at) ASC`, {
      type: (<any>DB).QueryTypes.SELECT,
    });

    let all_year_data = await DB.query(`SELECT YEAR(created_at) AS year_name, COUNT(*) AS value
    FROM generated_pins WHERE sub_product_id IN (SELECT id FROM sub_products WHERE user_id=${userId})
    GROUP BY year_name ASC`, {
      type: (<any>DB).QueryTypes.SELECT,
    });
    let valid_all_year_data = await DB.query(`SELECT YEAR(created_at) AS year_name, COUNT(*) AS value
    FROM generated_pins WHERE pin_status=0 AND sub_product_id IN (SELECT id FROM sub_products WHERE user_id=${userId})
    GROUP BY year_name ASC`, {
      type: (<any>DB).QueryTypes.SELECT,
    });
    let invalid_all_year_data = await DB.query(`SELECT YEAR(created_at) AS year_name, COUNT(*) AS value
    FROM generated_pins WHERE pin_status IN(1,2)
    AND sub_product_id IN (SELECT id FROM sub_products WHERE user_id=${userId})
    GROUP BY year_name ASC`, {
      type: (<any>DB).QueryTypes.SELECT,
    });

    const weekly_data = [all_week_data, valid_week_data, invalid_all_week_data];
    const monthly_data = [all_month_data, valid_all_month_data, invalid_all_month_data];
    const yearly_data = [all_year_data, valid_all_year_data, invalid_all_year_data];
    if (weekly_data && monthly_data && yearly_data) {
      return {
        all_week_data, valid_week_data, invalid_all_week_data,
        all_month_data, valid_all_month_data, invalid_all_month_data,
        all_year_data, valid_all_year_data, invalid_all_year_data,
      };
    }
  }

  public getDataForproducAndBatchesBar = async (userId) => {
    const product_result = await ProductModel.count({
      where: { userId },
      attributes: [
        [Sequelize.literal(`CONCAT(YEAR(created_at),'/',MONTH(created_at))`), "date"],
        [Sequelize.literal(`COUNT(*)`), "count"],
      ],
      group: ["date"],
    });
    const sub_product_result = await SubProductModel.count({
      where: { userId },
      attributes: [
        [Sequelize.literal(`CONCAT(YEAR(created_at),'/',MONTH(created_at))`), "date"],
        [Sequelize.literal(`COUNT(*)`), "sub_count"],
      ],
      group: ["date"],
    });
    const result = product_result.map((item) => {
      let obj = sub_product_result.find((o) => o.date === item.date);
      if (obj) {
        obj = { date: item.date, count: item.count, sub_count: obj.sub_count };
      } else {
        obj = { date: item.date, count: item.count, sub_count: 0 };
      }
      return { ...item, ...obj };
    });
    sub_product_result.map((item) => {
      let wobj = product_result.find((o) => o.date === item.date);
      if (wobj == undefined) {
        let obj = { date: item.date, count: 0, sub_count: item.sub_count };
        result.push(obj);
      }
    });
    if (result) {
      let n_result = result.sort(function (obj1, obj2) {
        return obj1.date - obj2.date;
      });
      return n_result;
    }
    throw new AppError("No product count", null, 401);
  }
  public getRewardsPieData = async (userId) => {
    const rewards = await RewardModel.count({
      where: { userId },
      group: ["reward_type"],
    });
    const loyalty = await LoyaltyPointsModel.count({
      where: { userId },
    });
    if (rewards || loyalty) {
      return { rewards, loyalty };
    }
    throw new AppError("No rewards count", null, 401);
  }
  public getScanHistoryData = async (userId) => {
    let all_id = [];
    let user_product = await SubProductModel.findAll({
      where: { userId },
      attributes: {
        include: [
          "id",
        ],
      },
    });
    if (user_product) {
      user_product.forEach((element) => {
        all_id.push(element.id);
      });
    }
    const scan_hist = await ScanHistoryModel.count({
      where: {
        productId: {
          [Op.in]: all_id,
        },
      },
      attributes: [
        [Sequelize.literal(`CONCAT(YEAR(created_at),'/',MONTH(created_at))`), "date"],
        [Sequelize.literal(`COUNT(*)`), "count"],
      ],
      group: ["scan_channel", "date"],
    });
    if (scan_hist) {
      let result = scan_hist.reduce((h, hist) => Object.assign(h,
        { [hist.date]: (h[hist.date] || []).concat({ [hist.scan_channel]: hist.count }) }), {});
      return result;
    }
    throw new AppError("No product count", null, 401);
  }
  public getSurveyQestRespData = async (userId) => {
    let all_count = await ActivitiesCountModel.findOne({ where: { userId } });
    let objReturb = [{
      title: "Total Surveys",
      value: all_count.surveys_count,
    },
    {
      title: "Total Questions",
      value: all_count.questions_count,
    },
    {
      title: "Total Responses",
      value: all_count.response_count,
    }];
    if (objReturb) {
      return objReturb;
    }
    throw new AppError("No surveys,questions and responses count", null, 401);
  }
  public GFG_sortFunction(a, b) {
    let dateA = new Date(a.date).getTime();
    let dateB = new Date(b.date).getTime();
    return dateA > dateB ? 1 : -1;
  }
  public getAllRedemptionPoints = async (userId: any) => {
    const redemptionPoints = await RedemptionModel.findAll({
      where: { userId, is_visible: this.VALUE_YES },
    });
    if (redemptionPoints) {
      return redemptionPoints;
    }
    throw new AppError("No redemption point found", null, 401);
  }
  public getAloyaltyPoints = async (userId: any) => {
    const loyalty = await RedemptionModel.findOne({
      where: { userId, is_visible: this.VALUE_YES },
    });
    if (loyalty) {
      return loyalty;
    }
    throw new AppError("No redemption point found", null, 401);
  }
  /**
   * View a product
   * @param {Object} product the product data
   */
  private viewProduct = async (product) => {
    product.dataValues.views++;
    const updated = await ProductModel.update(product.dataValues, {
      where: { slug: product.slug },
    });
    if (updated) {
      return ProductModel.findOne({ where: { slug: product.slug } });
    }
  }
  /**
   * Create a new slug (unique url string) for the product
   * @param {string} str the product title
   * @return {string} the new slug string
   */
  private createSlug = async (str: string) => {
    let newString = slugify(str, {
      remove: /[*+~.()'"!?:@#${}<>,]/g,
      lower: true,
    });
    const random = crypto.randomBytes(6).toString("hex");
    newString = `${newString}-${random}`;
    return newString;
  }
  /**
* gets offset value
* @param page
* @param limit
*/
  private getOffsetValue(page: number, limit: number) {
    let offset: number = 0;
    if (page == 1) {
      return offset;
    }

    offset = page * limit;
    if (page > 1) {
      offset++;
    }
    return offset;
  }
  /**
  * Build product(s) metadata
  * @param {Object} products the product results
  * @param {number} page current page
  */
  private buildMetaData(channels: any, page: number, channelsCount: number) {
    return {
      query_results: channels.length,
      page,
      comment:
        channels.length == 0
          ? "No Channel to display"
          : `Showing ${channels.length} of ${channelsCount} results`,
    };
  }
  // With async/await
  private async generateQR(genPin: any) {
    return await QRCode.toDataURL(String(genPin));
  }

  private myUniqueID(range: number) {
    let text = "";
    let possible = "1234567890";
    for (let i = 0; i < 4; i++) {
      let sup = Math.floor(Math.random() * possible.length);
      text += i > 0 && sup == i ? "0" : possible.charAt(sup);
    }
    let m = moment();
    let ms = m.milliseconds() + 1000 * (m.seconds() + 60 * (m.minutes() + 60 * m.hours()));
    return Math.floor(Math.pow(10, range - 1) + Number(text) + Math.random() * 9 * Math.pow(10, range - 1) + ms);
  }
  private async checkDuplicates(generator, count, data) {

    let pin_type;
    if (data.pin_type == "agent") {
      pin_type = 4;
    } else {
      pin_type = 16;
    }
    let arr = Array.from({ length: count } , () => ({ pin_value: generator(pin_type), pin_type: data.pin_type , subProductId: data.subProductId , pin_qrcode: "" }))

    console.log(arr)
    // return true;
    await GeneratePinModel.bulkCreate(arr);

    console.log("count", count);
    // for (let idx = 0; idx < count; idx++) {
    //   let gen = await generator(pin_type);
    //   let push_data = {
    //     pin_type: data.pin_type,
    //     subProductId: data.subProductId,
    //     pin_value: gen,
    //     pin_qrcode: "",
    //   };
    //   await GeneratePinModel.create(push_data);
    // }
    return true;
  }
  private generateUniqueIdentifier(length) {
    let text = "";
    let possible = "1234567890";
    for (let i = 0; i < length; i++) {
      let sup = Math.floor(Math.random() * possible.length);
      text += i > 0 && sup == i ? "0" : possible.charAt(sup);
    }
    return Number(text);
  }


  public getProductScanHistory = async (productId) => {

    // console.log(res)

    let all_id = [];
    console.log('p>> ' + productId)
    let user_product = await SubProductModel.findAll({
      where: { productId: productId },
      attributes: {
        include: [
          "id",
        ],
      },
    });


    if (user_product) {
      user_product.forEach((element) => {
        all_id.push(element.id);
      });
    }
    // console.log(all_id)

    var scan_hist = await ScanHistoryModel.findAll({
      where: { 
        productId: productId,
        // created_at: { [Op.between]: [ startDate, endDate ] }
      },
      raw: true,
    });
   

    return new Promise(resolve => {
        let env = this;
        // let i =0;
        // let c = [];
        /*
        scan_hist.forEach(function (hist) {
          // console.log(hist.scan_location)
              // console.log('<<<<dssswwq>>>>' + i)
              // console.log('<<<<grfdf>>>>' + scan_hist.length)
    
          // if(hist.scan_location){
             env.returnCordinates(hist.scan_location?hist.scan_location:'').then(cords => {
              hist.latitude = cords.latitude;
              // scan_hist[i] = cords.latitude;
              hist.longitude = cords.longitude;

              c.push(hist)
              // console.log(hist)

              if(scan_hist.length ==  (i)){
                // console.log('<<<<dsss>>>>' + i)
                // console.log(c)
                // console.log(i)

                // resolve(c);
              }
              i++;

            });
        });
*/
        var scan_his = scan_hist.map(function (hist) {

          env.returnCordinates(hist.scan_location?hist.scan_location:'').then(cords => {
            hist.latitude = cords.latitude;
            // scan_hist[i] = cords.latitude;
            hist.longitude = cords.longitude;

            // console.log(hist)

            // if(scan_hist.length ==  (i)){
            //   console.log('<<<<dsss>>>>' + i)
            //   resolve(c);
            // }
            // i++;

          });

          return hist
        });

        resolve(scan_his);
        console.log(scan_his)

    });
    
    
    if (scan_hist) {
      // let result = scan_hist.reduce((h, hist) => Object.assign(h,
      //   { [hist.date]: (h[hist.date] || []).concat({ [hist.scan_channel]: hist.count }) }), {});
      return scan_hist;
    }
    throw new AppError("No product count", null, 401);
  }

  async returnCordinates(address){
    const geocoder = NodeGeocoder(this.geocodeOptions);

    let f = await geocoder.geocode(address);        
    // console.log(f[0].latitude)
    let h = {latitude:f[0].latitude,longitude:f[0].longitude}
    return h;
  }
  public getScanHistoryByDate = async (productId,startDate,endDate) => {
    let all_id = [];
    console.log('p>> ' + productId)
    let user_product = await SubProductModel.findAll({
      where: { productId: productId },
      attributes: {
        include: [
          "id",
        ],
      },
    });


    if (user_product) {
      user_product.forEach((element) => {
        all_id.push(element.id);
      });
    }
    console.log(all_id)

    const scan_hist = await ScanHistoryModel.count({
      where: { 
        productId: productId,
        created_at: { [Op.between]: [ startDate, endDate ] }
      },
      attributes: [
        [Sequelize.literal(`CONCAT(YEAR(created_at),'/',MONTH(created_at),'/',WEEK(created_at))`), "date"],
        [Sequelize.literal(`COUNT(*)`), "count"],
      ],
      group: ["scan_channel", "date"],
    });
    console.log(scan_hist)
    
    if (scan_hist) {
      // let result = scan_hist.reduce((h, hist) => Object.assign(h,
      //   { [hist.date]: (h[hist.date] || []).concat({ [hist.scan_channel]: hist.count }) }), {});
      return scan_hist;
    }
    throw new AppError("No product count", null, 401);
  }
}
