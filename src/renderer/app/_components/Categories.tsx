import React from 'react';
import { saveCategoryThunk, deleteCategoryThunk } from '../_actions';
import { getReportCategories } from '../_api';
import AddCategory from './AddCategory';
import Reporter from './Reporter';
import ReportPage, { InjectedProps as Props } from '../_hocs/ReportPage';
import { convertToPriceFormat } from '../_helpers/formatter';

class Categories extends React.Component<Props> {
  render() {
    return (
      <>
        <AddCategory
          isOpened={this.props.isDialogElementOpened}
          isEdit={this.props.isElementEdit}
          categories={this.props.categories}
          id={this.props.elementIdRowSelected}
          onCategoryAdded={this.props.onElementSave}
          onCancelClick={this.props.closeDialogs}
        />

        <Reporter
          title="Categorías"
          onTableRowSelected={this.props.onTableRowSelected}
          totalPriceSold={this.props.totalPriceSold}
          totalElementsSold={this.props.totalElementsSold}
          elementIdRowSelected={this.props.elementIdRowSelected}
          filterDateActiveItemId={this.props.filterDateActiveItemId}
          onDateFilterSelected={this.props.onDateFilterSelected}
          filterStartDate={this.props.filterStartDate}
          isLoading={this.props.isLoading}
          filterEndDate={this.props.filterEndDate}
          onBackClick={this.props.onBackClick}
          notification={this.props.notification}
          onCloseNotification={this.props.onCloseNotification}
          elementTitles={[
            { title: 'Categoría' },
            { title: 'Productos' },
            { title: 'Total Productos Vendidos' },
            { title: 'Precio Total' },
          ]}
          elements={this.props.reportElements.map((el) => ({
            id: String(el.id),
            elements: [
              el.name,
              el.totalProducts,
              el.totalProductsSold,
              convertToPriceFormat(el.totalPrice),
            ],
          }))}
          buttons={[
            { id: 'add', onClick: this.props.onAddClick, name: '+' },
            { id: 'edit', onClick: this.props.onEditClick, name: '✎' },
            { id: 'remove', onClick: this.props.onRemoveClick, name: '🗑' },
          ]}
        />
      </>
    );
  }
}

export default ReportPage({
  saveElementThunk: saveCategoryThunk,
  deleteElementThunk: deleteCategoryThunk,
  getReportElements: getReportCategories,
  deleteMessageTitle: 'Eliminar Categoría',
  deleteMessage: 'Quieres eliminar la categoría',
})(Categories);
