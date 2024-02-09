import React from 'react';
import { deleteFlavorThunk, saveFlavorThunk } from '../_actions';
import { getReportFlavors } from '../_helpers/api';
import ReportPage, { InjectedProps as Props } from '../_hocs/ReportPage';
import AddFlavor from './AddFlavor';
import Reporter from './Reporter';

class Flavors extends React.Component<Props> {
  render() {
    return (
      <>
        <AddFlavor
          isOpened={this.props.isDialogElementOpened}
          isEdit={this.props.isElementEdit}
          flavors={this.props.flavors}
          id={this.props.elementIdRowSelected}
          onAdded={this.props.onElementSave}
          onCancelClick={this.props.closeDialogs}
        />

        <Reporter
          title="Sabores"
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
            { title: 'Sabor' },
            { title: 'Nombre de Impresión' },
            { title: 'Unidades' },
            { title: 'Total Vendidos' },
          ]}
          elements={this.props.reportElements.map((el: any) => ({
            id: String(el.id),
            elements: [
              el.name,
              el.printName || '-',
              el.units || 0,
              el.totalQuantitySold,
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
  saveElementThunk: saveFlavorThunk,
  deleteElementThunk: deleteFlavorThunk,
  getReportElements: getReportFlavors,
  deleteMessageTitle: 'Eliminar Sabor',
  deleteMessage: 'Quieres eliminar el sabor',
})(Flavors);
