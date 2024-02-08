import React from 'react';
import { Product, Category, StoreState, ReportProduct, ReportsArgs, Flavor } from '../_models';
import { saveProductThunk, deleteProductThunk } from '../_actions';
import { getReportProducts } from '../_api'
import AddProduct from './AddProduct';
import Reporter from './Reporter';
import ReportPage, { InjectedProps as Props } from '../_hocs/ReportPage';
import { convertToPriceFormat } from '../_helpers/formatter';

class Products extends React.Component<Props> {
  getProductCategoryName(categoryId: Category['id']) {
    const category = this.props.categories.find(el2 => el2.id === categoryId)
    return (category && category.name) || '-'
  }

  render() {
    return (
      <>
        <AddProduct
          isOpened={this.props.isDialogElementOpened}
          isEdit={this.props.isElementEdit}
          productId={this.props.elementIdRowSelected}
          products={this.props.products}
          categories={this.props.categories}
          flavors={this.props.flavors}
          onCancelClick={this.props.closeDialogs}
          onProductAdded={this.props.onElementSave}
        />

        <Reporter
          title='Productos'
          onTableRowSelected={this.props.onTableRowSelected}
          totalPriceSold={this.props.totalPriceSold}
          totalElementsSold={this.props.totalElementsSold}
          elementIdRowSelected={this.props.elementIdRowSelected}
          isLoading={this.props.isLoading}

          onDateFilterSelected={this.props.onDateFilterSelected}
          filterDateActiveItemId={this.props.filterDateActiveItemId}
          filterStartDate={this.props.filterStartDate}
          filterEndDate={this.props.filterEndDate}

          onBackClick={this.props.onBackClick}
          notification={this.props.notification}
          onCloseNotification={this.props.onCloseNotification}
          elementTitles={[
            { title: 'Producto' },
            { title: 'Nombre de Impresión' },
            { title: 'Categoría' },
            { title: 'Precio' },
            { title: 'Unid. en Inventario' },
            { title: 'Vendidos' },
            { title: 'Precio Total' },
          ]}
          elements={this.props.reportElements.map((el, idx) => ({
            id: String(el.id),
            elements: [
              el.name,
              el.printName || '-',
              this.getProductCategoryName(el.category),
              // convertToPriceFormat(this.props.products[idx].price),
              convertToPriceFormat(el.price),
              el.units || 0,
              el.totalQuantitySold,
              convertToPriceFormat(el.totalPrice)
            ]
          }))}
          buttons={[
            { id: 'add', onClick: this.props.onAddClick, name: '+' },
            { id: 'edit', onClick: this.props.onEditClick, name: '✎' },
            { id: 'remove', onClick: this.props.onRemoveClick, name: '🗑' },
          ]}
        />
      </>
    )
  }
}

export default ReportPage({
  saveElementThunk: saveProductThunk,
  deleteElementThunk: deleteProductThunk,
  getReportElements: getReportProducts,
  deleteMessageTitle: 'Eliminar Producto',
  deleteMessage: 'Quieres eliminar el producto',
})(Products)
