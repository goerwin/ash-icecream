import React from 'react';
import { Form, FormRow } from './Form/Form';
import { Dialog, TextField, Snackbar } from 'material-ui';
import styled from 'styled-components';
import Button from './Button/Button';
import ModalButtonsWrapper from './ModalButtonsWrapper';
import { Flavor } from '../_models';

interface Props {
  id?: Flavor['id'],
  isOpened: boolean,
  flavors: Flavor[],
  isEdit?: boolean,
  onAdded: (flavor: Flavor) => void,
  onCancelClick: () => void,
}

interface State {
  name: string,
  notification: string,
  printName?: string,
  units?: number,
}

export default class AddFlavor extends React.Component<Props, State> {
  state: State = this.calculateInitialState(this.props)

  componentWillReceiveProps(newProps: Props) {
    if (this.props.isOpened === newProps.isOpened) { return; }
    if (!newProps.isOpened) { return; }
    this.setState(this.calculateInitialState(newProps));
  }

  calculateInitialState(props: Props): State {
    let flavor;

    if (props.isEdit && props.id) {
      flavor = props.flavors.find(el => el.id === props.id)
    }

    if (flavor) {
      return {
        notification: '',
        name: flavor.name,
        printName: flavor.printName,
        units: flavor.units,
      }
    }

    return {
      notification: '',
      name: '',
    }
  }

  handleSubmit = () => {
    if (this.state.name === '') {
      this.openNotification('Nombre es Obligatorio')
      return;
    }

    this.props.onAdded({
      id: this.props.id || 0,
      units: this.state.units || 0,
      name: this.state.name,
      printName: this.state.printName,
    })
  }

  handleNameChange = (evt: any) => {
    this.setState({ ...this.state, name: evt.target.value })
  }

  handlePrintnameChange = (evt: any) => {
    this.setState({ ...this.state, printName: evt.target.value })
  }

  handleUnitsChange = (evt: any) => {
    this.setState({ ...this.state, units: evt.target.value })
  }

  openNotification = (notification: string) => {
    this.setState({ ...this.state, notification })
  }

  closeNotification = () => {
    this.setState({ ...this.state, notification: '' })
  }

  render() {
    const actions = [
      <ModalButtonsWrapper>
        <Button type='button' onClick={this.props.onCancelClick}>Cancelar</Button>
        <Button tyep='button' onClick={this.handleSubmit}>
          {!!this.props.isEdit ? 'Editar' : 'Agregar' }
        </Button>
      </ModalButtonsWrapper>
    ]

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
          title={!!this.props.isEdit ? 'Editar Sabor' : 'Agregar Sabor'}
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

            <FormRow>
              <TextField
                floatingLabelText="Nombre de Impresión"
                fullWidth
                value={this.state.printName || ''}
                onChange={this.handlePrintnameChange}
                />
            </FormRow>

            <FormRow>
              <TextField
                floatingLabelText="Unidades en Inventario"
                fullWidth
                type='number'
                value={this.state.units || 0}
                onChange={this.handleUnitsChange}
                />
            </FormRow>
          </Form>
        </Dialog>
      </>
    )
  }
}
