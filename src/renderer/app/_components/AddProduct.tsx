import React from 'react';
import {
  Dialog,
  TextField,
  IconButton,
  FlatButton,
  Toggle,
  Snackbar,
  Divider,
  MenuItem,
  SelectField } from 'material-ui';
import SvgClose from 'material-ui/svg-icons/navigation/close';
import Button from './Button/Button';
import { Form, FormRow } from './Form/Form';
import { Product, Category, Flavor } from '../_models';
import ModalButtonsWrapper from './ModalButtonsWrapper';

interface Props {
  isOpened: boolean;
  products: Product[];
  categories: Category[];
  flavors: Flavor[];
  productId?: Product['id'];
  isEdit?: boolean;
  onCancelClick: () => void;
  onProductAdded: (product: Product) => void;
}

interface State {
  name: Product['name'],
  printName?: Product['printName'],
  category: Category['id'],
  price?: Product['price'],
  description?: Product['description'],
  units?: Product['units'],
  notification: string,
  flavors: { flavorOptions: Flavor['id'][] }[],
}

export default class AddProduct extends React.Component<Props, State> {
  state: State = this.calculateInitialState(this.props)

  componentWillReceiveProps(newProps: Props) {
    if (this.props.isOpened === newProps.isOpened) { return; }
    if (!newProps.isOpened) { return; }
    this.setState(this.calculateInitialState(newProps));
  }

  calculateInitialState(props: Props): State {
    let product;

    if (props.isEdit && props.productId) {
      product = props.products.find(el => el.id === props.productId)
    }

    if (product) {
      return {
        notification: '',
        name: product.name,
        printName: product.printName,
        units: product.units,
        category: product.category,
        price: product.price,
        description: product.description,
        flavors: product.flavors
      }
    }

    return {
      notification: '',
      name: '',
      printName: '',
      category: 0,
      price: undefined,
      flavors: []
    }
  }

  openNotification = (notification: string) => {
    this.setState({ ...this.state, notification })
  }

  closeNotification = () => {
    this.setState({ ...this.state, notification: '' })
  }

  handleSubmit = () => {
    const addProduct = this.state;

    if (!addProduct.name || addProduct.price === undefined) {
      this.openNotification('Nombre y Precio son Obligatorios')
      return;
    }

    const newProduct: Product = {
      id: this.props.productId || 0,
      units: addProduct.units || 0,
      name: addProduct.name,
      printName: addProduct.printName,
      price: addProduct.price,
      flavors: addProduct.flavors.filter(el => el.flavorOptions.length > 0),
      category: addProduct.category,
      description: addProduct.description
    };

    this.props.onProductAdded(newProduct);
  }

  handleNameChange = (evt: any, value: any) => {
    this.setState({ ...this.state, name: value });
  }

  handlePrintNameChange = (evt: any, value: any) => {
    this.setState({ ...this.state, printName: value });
  }

  handleCategoryChange = (_: any, _a: any, value: any) => {
    this.setState({ ...this.state, category: value });
  }

  handleIsComposedChange = (evt: any, value: any) => {
    const flavors: State['flavors'] = [];

    if (value) { flavors.push({ flavorOptions: [] }); }
    this.setState({ ...this.state, flavors })
  }

  handlePriceChange = (evt: any, value: any) => {
    if (isNaN(value)) { return; }
    this.setState({ ...this.state, price: value })
  }

  handleUnitsChange = (evt: any, value: any) => {
    if (isNaN(value)) { return; }
    this.setState({ ...this.state, units: value })
  }

  handleAddFlavorOptions = (idx: number, values: any) => {
    const newFlavors = [ ...this.state.flavors ];
    newFlavors[idx].flavorOptions = values;
    this.setState({ ...this.state, flavors: newFlavors })
  }

  handleDeleteCompositeOption = (idx: number) => {
    const newFlavors = this.state.flavors.filter((el, i) => i !== idx);
    this.setState({ ...this.state, flavors: newFlavors })
  }

  handleAddCompositeProduct = () => {
    this.setState({
      ...this.state,
      flavors: [...this.state.flavors, { flavorOptions: [] }]
    });
  }

  selectAllFlavors(select: boolean, idx: number) {
    const newFlavors = [ ...this.state.flavors ];

    if (select) {
      newFlavors[idx].flavorOptions = this.props.flavors.map(el => el.id)
    } else {
      newFlavors[idx].flavorOptions = []
    }

    this.setState({ ...this.state, flavors: newFlavors })
  }

  render() {
    const actions = [
      <ModalButtonsWrapper>
        <Button type='button' onClick={this.props.onCancelClick}>Cancelar</Button>
        <Button type='button' onClick={this.handleSubmit}>
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
          title={!!this.props.isEdit ? 'Editar Producto' : 'Agregar Producto'}
          open={this.props.isOpened}
          autoScrollBodyContent
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
                onChange={this.handlePrintNameChange}
                />
            </FormRow>

            <FormRow>
              <SelectField
                floatingLabelText='Categoría'
                fullWidth
                value={this.state.category}
                onChange={this.handleCategoryChange}
              >
                {(this.props.categories.map(el =>
                  <MenuItem key={el.id} value={el.id} primaryText={el.name} />
                ))}
              </SelectField>
            </FormRow>

            <FormRow className='has-mb'>
              <TextField
                floatingLabelText="Unidades en Inventario"
                type='number'
                fullWidth
                value={this.state.units || 0}
                onChange={this.handleUnitsChange}
                />
            </FormRow>

            <FormRow className='has-mb'>
              <TextField
                floatingLabelText="Precio"
                type='number'
                fullWidth
                value={this.state.price || ''}
                onChange={this.handlePriceChange}
                />
            </FormRow>

            <FormRow className='has-mb' style={{ fontSize: '16px' }}>
              <Toggle
                label='Sabores'
                labelPosition="right"
                toggled={this.state.flavors.length > 0}
                onToggle={this.handleIsComposedChange}
              />
            </FormRow>

            {this.state.flavors.length === 0 ? null :
              <>
                {this.state.flavors.map((options, idx) =>
                  <FormRow key={idx} className='has-rowitems'>
                    <SelectField
                      multiple
                      floatingLabelText={`Opciones para sabor ${idx + 1}`}
                      value={options.flavorOptions}
                      onChange={(a, b, values: any) => {
                        this.handleAddFlavorOptions(idx, values);
                      }}
                    >
                      <MenuItem
                        value
                        checked={
                          this.props.flavors.every(el =>
                            this.state.flavors[idx].flavorOptions.some(el2 => el2 === el.id)
                          )
                        }
                        onClick={() => { this.selectAllFlavors(true, idx) }}
                      >
                        Seleccionar todos
                      </MenuItem>

                      <MenuItem
                        checked={
                          this.props.flavors.every(el =>
                            !(this.state.flavors[idx].flavorOptions.some(el2 => el2 === el.id))
                          )
                        }
                        onClick={() => { this.selectAllFlavors(false, idx) }}
                      >
                        Desmarcar todos
                      </MenuItem>
                      <Divider />

                      {(this.props.flavors.map(el =>
                        <MenuItem
                          checked={!!this.state.flavors[idx]
                            .flavorOptions.find(el2 => el2 === el.id)
                          }
                          key={el.id}
                          value={el.id}
                          primaryText={el.name}
                        />
                      ))}
                    </SelectField>

                    <IconButton
                      style={{ top: 10 }}
                      onClick={() => { this.handleDeleteCompositeOption(idx); }}
                      tooltip='Eliminar'
                    >
                      <SvgClose />
                    </IconButton>
                  </FormRow>
                )}
                <FormRow className='has-mb'>
                  <FlatButton
                    label='Agregar otra opción'
                    primary={true}
                    onClick={this.handleAddCompositeProduct}
                  />
                </FormRow>
              </>
            }
            <input type="submit" hidden/>
          </Form>
        </Dialog>
      </>
    )
  }
}
