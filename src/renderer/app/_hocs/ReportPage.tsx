import { Moment } from 'moment';
import React from 'react';
import { connect } from 'react-redux';

import { setErrorMessage, setView } from '../_actions';
import Confirmation from '../_components/Confirmation';
import { convertToPriceFormat } from '../_helpers/formatter';
import {
  Category,
  Flavor,
  Product,
  ReportsArgs,
  StoreState,
  View,
} from '../../../_helpers/models';

// Props you want the resulting component to take (besides the props of the wrapped component)
interface Props {
  notification: string;
  onCloseNotification: () => void;
}

// TODO: The HOC should shell if its injectedProps are not implemented by
// the wrapped component. You should also export this interface and wrapped component
// should extend it in its Props
// Props the HOC adds to the wrapped component
export type InjectedProps = {
  products: Product[];
  categories: Category[];
  flavors: Flavor[];
  reportElements: any[];

  isDialogElementOpened: any;
  isElementEdit: any;
  closeDialogs: any;
  onElementSave: any;
  onTableRowSelected: any;
  totalPriceSold: any;
  totalElementsSold: any;
  elementIdRowSelected: any;
  filterDateActiveItemId: any;
  onDateFilterSelected: any;
  filterStartDate: any;
  onDeleteAllElementsClick: any;
  isLoading: any;
  filterEndDate: any;
  onBackClick: any;
  notification: any;
  onCloseNotification: any;
  onAddClick: any;
  onEditClick: any;
  onRemoveClick: any;
};

interface Props {
  categories: Category[];
  products: Product[];
  flavors: Flavor[];
  isLoading: boolean;
  notification: string;
  onGetAllElements: (filters: ReportsArgs['filters']) => any;
  onSaveElement: <T>(element: T) => Promise<void>;
  onDeleteElement: (id: any) => Promise<void>;
  onCloseNotification: () => void;
  onBackClick: () => void;
}

interface State {
  isLoading: boolean;
  isDialogElementOpened: boolean;
  filterStartDate?: Moment | null;
  filterEndDate?: Moment | null;
  filterDateActiveItemId?: string;
  elementIdRowSelected?: any;
  showConfirmDelete: boolean;
  showConfirmDeleteAll: boolean;
  isElementEdit?: boolean;
  notification: string;
  reportElements: any[];
}

export default (options: {
    deleteAllElementsFn?: () => Promise<any>;
    saveElementThunk?: any;
    deleteElementThunk?: any;
    deleteElementFn?: (id: number) => Promise<any>;
    getReportElements: (filters: any) => Promise<any[]>;
    deleteMessage: string;
    deleteMessageTitle: string;
  }) =>
  (Comp: React.ComponentType<InjectedProps>) => {
    type ReportPageProps = ReturnType<typeof mapStateToProps> &
      ReturnType<typeof mapDispatchToProps>;

    class ReportPage extends React.Component<ReportPageProps> {
      state: State = this.calculateInitialState(this.props);

      calculateInitialState(
        props: Pick<ReportPageProps, 'isLoading' | 'notification'>
      ) {
        return {
          isDialogElementOpened: false,
          showConfirmDelete: false,
          showConfirmDeleteAll: false,
          isLoading: props.isLoading,
          reportElements: [],
          notification: this.props.notification,
        };
      }

      // TODO: This has to be in the child component
      get totalElementsSold() {
        return this.state.reportElements.reduce(
          (total, el) => total + el.totalQuantitySold,
          0
        );
      }

      // TODO: This has to be in the child component
      get totalPriceSold() {
        return convertToPriceFormat(
          this.state.reportElements.reduce(
            (total, el) => total + el.totalPrice,
            0
          )
        );
      }

      get confirmationMessage() {
        const el = this.state.reportElements.find(
          (el) => this.state.elementIdRowSelected == el.id
        );
        return el ? `${options.deleteMessage} ${el.name || ''}?` : '';
      }

      componentDidMount() {
        this.operateReportElements();
      }

      componentWillReceiveProps(newProps: ReportPageProps) {
        this.setState(this.calculateInitialState(newProps));
      }

      operateReportElements(filters: ReportsArgs['filters'] = {}) {
        this.setState({ ...this.state, isLoading: true });

        return options
          .getReportElements(filters)
          .then((reportElements) => {
            this.setState({ ...this.state, reportElements });
          })
          .catch((err) => {
            this.setState({ ...this.state, notification: err.message });
          })
          .then(() => {
            this.setState({ ...this.state, isLoading: false });
          });
      }

      closeAddEditDialog = () => {
        this.setState({ ...this.state, isDialogElementOpened: false });
      };

      handleAddClick = () => {
        this.setState({
          ...this.state,
          isElementEdit: false,
          isDialogElementOpened: true,
          elementIdRowSelected: undefined,
        });
      };

      handleEditClick = () => {
        if (!this.state.elementIdRowSelected) {
          return;
        }
        this.setState({
          ...this.state,
          isDialogElementOpened: true,
          isElementEdit: true,
        });
      };

      handleElementSave = <T extends {}>(element: T) => {
        if (this.props.isLoading) {
          return;
        }
        this.props
          .onSaveElement(element)
          .then(() => this.operateReportElements())
          .then(this.closeAddEditDialog);
      };

      handleRemoveElement = () => {
        if (!this.state.elementIdRowSelected) {
          return;
        }
        this.props
          .onDeleteElement(this.state.elementIdRowSelected)
          .then(() => this.operateReportElements())
          .then(this.closeConfirmationDialog);
      };

      handleDeleteAllElements = () => {
        options.deleteAllElementsFn &&
          options
            .deleteAllElementsFn()
            .then(() => this.operateReportElements())
            .then(this.closeConfirmationDialog);
      };

      handleRemoveClick = () => {
        if (!this.state.elementIdRowSelected) {
          return;
        }
        this.setState({ ...this.state, showConfirmDelete: true });
      };

      handleRemoveAllClick = () => {
        this.setState({ ...this.state, showConfirmDeleteAll: true });
      };

      handleTableRowSelected = (row: number, id: string) => {
        this.setState({ ...this.state, elementIdRowSelected: Number(id) });
      };

      handleDateFilterSelected = (
        startDate: Moment | null | undefined,
        endDate: Moment | null | undefined,
        activeItemId: string | undefined
      ) => {
        // TODO: Ugly solution to avoid setState twice
        // and this updating at last after operateReportElements
        this.state = {
          ...this.state,
          filterStartDate: startDate,
          filterEndDate: endDate,
          filterDateActiveItemId: activeItemId,
        };

        let dateFilter;

        if (startDate && endDate) {
          dateFilter = {
            isoStart: startDate.toISOString(),
            isoEnd: endDate.toISOString(),
          };
        }

        this.operateReportElements({ date: dateFilter });
      };

      closeConfirmationDialog = () => {
        this.setState({
          ...this.state,
          showConfirmDelete: false,
          showConfirmDeleteAll: false,
        });
      };

      handleBackClick = () => {
        this.props.setView('admin');
      };

      render() {
        return (
          <>
            <Confirmation
              isOpened={this.state.showConfirmDeleteAll}
              title={'Eliminar Todos'}
              onAccept={this.handleDeleteAllElements}
              onCancel={this.closeConfirmationDialog}
              message={'Deseas eliminar todos los elementos?'}
            />

            <Confirmation
              isOpened={this.state.showConfirmDelete}
              title={options.deleteMessageTitle}
              onAccept={this.handleRemoveElement}
              onCancel={this.closeConfirmationDialog}
              message={this.confirmationMessage}
            />

            <Comp
              products={this.props.products}
              categories={this.props.categories}
              flavors={this.props.flavors}
              reportElements={this.state.reportElements}
              isDialogElementOpened={this.state.isDialogElementOpened}
              isElementEdit={this.state.isElementEdit}
              closeDialogs={this.closeAddEditDialog}
              onElementSave={this.handleElementSave}
              onTableRowSelected={this.handleTableRowSelected}
              totalPriceSold={this.totalPriceSold}
              totalElementsSold={this.totalElementsSold}
              elementIdRowSelected={this.state.elementIdRowSelected}
              onDateFilterSelected={this.handleDateFilterSelected}
              filterDateActiveItemId={this.state.filterDateActiveItemId}
              filterStartDate={this.state.filterStartDate}
              filterEndDate={this.state.filterEndDate}
              isLoading={this.state.isLoading}
              onBackClick={this.handleBackClick}
              notification={this.state.notification}
              onCloseNotification={this.props.onCloseNotification}
              onAddClick={this.handleAddClick}
              onEditClick={this.handleEditClick}
              onRemoveClick={this.handleRemoveClick}
              onDeleteAllElementsClick={this.handleRemoveAllClick}
            />
          </>
        );
      }
    }

    const mapStateToProps = (state: StoreState) => ({
      view: state.view,
      notification: state.errorMessage,
      products: state.products,
      categories: state.categories,
      flavors: state.flavors,
      isLoading: state.isGlobalLoading,
    });

    const mapDispatchToProps = (dispatch: any) => ({
      setView: (view: View) => dispatch(setView(view)),
      onCloseNotification: () => {
        dispatch(setErrorMessage(''));
      },
      onSaveElement: (element: any) => {
        if (!options.saveElementThunk) {
          return;
        }
        return dispatch(options.saveElementThunk(element));
      },
      onDeleteElement: (id: any) => {
        if (options.deleteElementThunk) {
          return dispatch(options.deleteElementThunk(id));
        }

        if (options.deleteElementFn) {
          return options.deleteElementFn(id);
        }
      },
    });

    return connect(mapStateToProps, mapDispatchToProps)(ReportPage);
  };
