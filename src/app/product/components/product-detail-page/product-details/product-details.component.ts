import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AppState } from './../../../../interfaces';
import { Store } from '@ngrx/store';
import { CheckoutActions } from './../../../../checkout/actions/checkout.actions';
import { Variant } from './../../../../core/models/variant';
import { VariantRetriverService } from './../../../../core/services/variant-retriver.service';
import { Component, OnInit, Input } from '@angular/core';
import { Product } from './../../../../core/models/product';
import { VariantParserService } from './../../../../core/services/variant-parser.service';
import { ProductService } from './../../../../core/services/product.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  @Input() product: Product;
  customOptionTypesHash: any;
  currentSelectedOptions = {};
  description: any;
  images: any;
  mainOptions: any;
  correspondingOptions: any;
  variantId: any;
  productID: any
  productdata: any;

  constructor(
    private variantParser: VariantParserService,
    private variantRetriver: VariantRetriverService,
    private checkoutActions: CheckoutActions,
    private store: Store<AppState>,
    private productService: ProductService,
    private router: Router,
    private toastrService: ToastrService
  ) { }

  ngOnInit() {
    this.description = this.product.description;
    this.images = this.product.master.images;
    this.variantId = this.product.master.id;
    this.customOptionTypesHash = this.variantParser
      .getOptionsToDisplay(this.product.variants, this.product.option_types);
    this.mainOptions = this.makeGlobalOptinTypesHash(this.customOptionTypesHash);
    this.correspondingOptions = this.mainOptions;
    this.productID = this.product.id;
    this.productService.getRecentlyViewedProducts().
      subscribe(productdata => {
        this.productdata = productdata

      });
  }

  /**
   * @param: option: { key: "small",
   *                   value: {optionValue: {etc etc},
   *                   variantIds: [1,2,3] }}
   */
  onOptionClick(option) {
    const result = new VariantRetriverService()
      .getVariant(this.currentSelectedOptions,
      this.customOptionTypesHash,
      option, this.product);

    this.createNewCorrespondingOptions(result.newCorrespondingOptions,
      option.value.optionValue.option_type_name);

    this.currentSelectedOptions = result.newSelectedoptions;
    const newVariant: Variant = result.variant;
    this.variantId = newVariant.id;
    this.description = newVariant.description;
    this.images = newVariant.images;
  }

  makeGlobalOptinTypesHash(customOptionTypes) {
    const temp = {};
    for (const key in customOptionTypes) {
      if (customOptionTypes.hasOwnProperty(key)) {
        temp[key] = Object.keys(customOptionTypes[key]);
      }
    };
    return temp;
  }

  createNewCorrespondingOptions(newOptions, optionKey) {
    for (const key in this.correspondingOptions) {
      if (this.correspondingOptions.hasOwnProperty(key) && key !== optionKey) {
        this.correspondingOptions[key] = newOptions[key];
      }
    }
  }

  addToCart(quantitiy) {
    this.store.dispatch(this.checkoutActions.addToCart(this.variantId, quantitiy));
  }

  markAsFavorite() {
    this.productService.markAsFavorite(this.product.id).subscribe((res) => {
      this.toastrService.info(res['message'], 'info')
    });
  }

  showReviewForm() {
    this.router.navigate([this.product.slug, 'write_review'], { queryParams: { 'prodId': this.productID } });
  }

}



