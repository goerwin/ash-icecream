import React from 'react';
import {
  Table,
  Thead,
  Th,
  Tbody,
  Td,
  Tr
} from './Table';

interface Props {
  titles: { title: string; }[],
  items: { id: string; elements: (string | number)[] }[],
  isSelectable?: boolean,
  rowSelected?: string,
  onRowClick?: (rowNumber: number, id: string) => void,
  onRowSelected?: (rowNumber: number, id: string) => void,
  onRowDoubleClick?: (rowNumber: number, id: string) => void,
}

interface State {
  idSelected?: string;
}

export default class TableViewer extends React.Component<Props, State> {
  state: State = this.calculateInitialState(this.props)

  componentWillReceiveProps(newProps: Props) {
    if (newProps.rowSelected === this.props.rowSelected) { return; }
    this.setState(this.calculateInitialState(newProps));
  }

  calculateInitialState(props: Props): State {
    return { idSelected: props.rowSelected }
  }

  handleRowClick = (idx: number, id: string) => {
    if (this.props.onRowClick) { this.props.onRowClick(idx, id); }

    if (this.state.idSelected === id) {
      this.setState({ idSelected: undefined })
    } else {
      if (this.props.onRowSelected) { this.props.onRowSelected(idx, id); }
      this.setState({ idSelected: id })
    }
  }

  handleRowDoubleClick = (idx: number, id: string) => {
    if (this.props.onRowDoubleClick) { this.props.onRowDoubleClick(idx, id); }
    if (this.props.onRowSelected) { this.props.onRowSelected(idx, id); }
    this.setState({ idSelected: id })
  }

  render() {
    return (
      <Table>
        <Thead>
          <Tr>
            <Th>#</Th>
            {this.props.titles.map(el =>
              <Th key={el.title}>{el.title}</Th>
            )}
          </Tr>
        </Thead>
        <Tbody>
          {this.props.items.length === 0 ?
            <Tr>
              <Td colSpan={this.props.titles.length} style={{
                color: '#ccc',
                paddingTop: 20,
                paddingBottom: 20
              }}>
                No hay elementos
              </Td>
            </Tr>
            :
            this.props.items.map((el, idx) =>
              <Tr
                key={el.id}
                onDoubleClick={() => { this.handleRowDoubleClick(idx, el.id) }}
                onClick={() => { this.handleRowClick(idx, el.id) }}
                {...!this.props.isSelectable ? {} :
                  {
                    isActive: this.state.idSelected === el.id
                  }
                }
              >
                <Td>{idx + 1}</Td>
                {el.elements.map((el2, idx2) =>
                  <Td key={idx2}>{el2}</Td>
                )}
              </Tr>
            )}
        </Tbody>
      </Table>
    )
  }
}
