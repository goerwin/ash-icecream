import { Dialog, Snackbar, TextField } from 'material-ui';
import React from 'react';
import { Category } from '../../../schemas';
import Button from './Button/Button';
import { Form, FormRow } from './Form/Form';
import ModalButtonsWrapper from './ModalButtonsWrapper';

interface Props {
  id?: Category['id'];
  isOpened: boolean;
  categories: Category[];
  isEdit?: boolean;
  onCategoryAdded: (category: Category) => void;
  onCancelClick: () => void;
}

interface State {
  name: string;
  notification: string;
}

export default class AddCategory extends React.Component<Props, State> {
  state: State = this.calculateInitialState(this.props);

  componentWillReceiveProps(newProps: Props) {
    if (this.props.isOpened === newProps.isOpened) {
      return;
    }
    if (!newProps.isOpened) {
      return;
    }
    this.setState(this.calculateInitialState(newProps));
  }

  calculateInitialState(props: Props): State {
    let category;

    if (props.isEdit && props.id) {
      category = props.categories.find((el) => el.id === props.id);
    }

    if (category) {
      return {
        notification: '',
        name: category.name,
      };
    }

    return {
      notification: '',
      name: '',
    };
  }

  handleSubmit = () => {
    if (this.state.name === '') {
      this.openNotification('Nombre es Obligatorio');
      return;
    }

    const newCategory: Category = {
      id: this.props.id || 0,
      name: this.state.name,
    };

    this.props.onCategoryAdded(newCategory);
  };

  handleNameChange = (evt: any) => {
    this.setState({ ...this.state, name: evt.target.value });
  };

  openNotification = (notification: string) => {
    this.setState({ ...this.state, notification });
  };

  closeNotification = () => {
    this.setState({ ...this.state, notification: '' });
  };

  render() {
    const actions = [
      <ModalButtonsWrapper>
        <Button type="button" onClick={this.props.onCancelClick}>
          Cancelar
        </Button>
        <Button tyep="button" onClick={this.handleSubmit}>
          {!!this.props.isEdit ? 'Editar' : 'Agregar'}
        </Button>
      </ModalButtonsWrapper>,
    ];

    return (
      <>
        <Snackbar
          open={!!this.state.notification}
          message={this.state.notification}
          style={{ textAlign: 'center' }}
          onRequestClose={this.closeNotification}
          autoHideDuration={3000}
        />

        <Dialog
          open={this.props.isOpened}
          title={!!this.props.isEdit ? 'Editar Categoría' : 'Agregar Categoría'}
          actions={actions}
        >
          <Form onSubmit={this.handleSubmit}>
            <FormRow>
              <TextField
                autoFocus
                floatingLabelText="Nombre"
                fullWidth
                value={this.state.name}
                onChange={this.handleNameChange}
              />
            </FormRow>
          </Form>
        </Dialog>
      </>
    );
  }
}
