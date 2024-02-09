import React from 'react';
import { ipcRenderer } from 'electron';
import { Dialog, Snackbar } from 'material-ui';
import styled from 'styled-components';
import BigMenu from './BigMenu/BigMenu';
import Button from './Button/Button';
import ModalButtonsWrapper from './ModalButtonsWrapper';

import Confirmation from '../_components/Confirmation';
import GlobalLoading from '../_components/GlobalLoading';

// @ts-ignore
import ElectronStore from '../../../_db/electronStore';
import {
  elementsDBStore,
  receiptsDBStore,
  userPreferencesDBStore,
  // @ts-ignore
} from '../../../_singletons/dbInstances';
import { dbSchema } from '../../../schemas';

const items = [
  { title: 'Atrás', id: 'back', link: '/' },
  { title: 'Eliminar BD', id: 'deleteDB' },
  { title: 'Importar BD', id: 'importDB' },
  { title: 'Exportar BD', id: 'exportDB' },
  { title: 'Acerca de', id: 'about' },
];

const Paragraph = styled.p`
  margin-bottom: 10px;
`;

const Bold = styled.span`
  font-weight: bold;
`;

enum DBUserPreferencesKeys {
  DB_BACKUP_FILEPATH = 'DB_BACKUP_FILEPATH',
}
type Props = {
  onBackClick: () => void;
};

type State = {
  confirmationTitle?: string;
  confirmationMessage?: string;
  elementClicked?: string;
  isLoading?: boolean;
  notification?: string;
  dialogAboutShow?: boolean;
};

export default class Settings extends React.Component<Props, State> {
  state: State = {};

  handleBigMenuItemClick = (id: string) => {
    const item = items.filter((el) => el.id === id)[0];

    if (id === 'back') {
      this.props.onBackClick();
    } else if (id === 'deleteDB') {
      this.setState({
        ...this.state,
        confirmationTitle: item.title,
        confirmationMessage: 'Quieres eliminar la base de datos?',
        elementClicked: item.id,
      });
    } else if (id === 'importDB') {
      this.setState({
        ...this.state,
        confirmationTitle: item.title,
        confirmationMessage:
          'Quieres importar la base de datos? ' +
          '(se borrarán los datos actuales)',
        elementClicked: item.id,
      });
    } else if (id === 'about') {
      this.setState({
        ...this.state,
        dialogAboutShow: true,
      });
    } else if (id === 'exportDB') {
      this.handleExportDB();
    }
  };

  handleImportDB = async () => {
    // todo:
    const db = dbSchema.parse(
      await ipcRenderer.invoke('OPEN_IMPORT_DB_PICKER')
    );
    console.log('bb', db);

    // todo: get items
    //todo: save in memory and then pass that info to the main process
    // use zod
    return;
  };

  handleExportDB = () => {
    // todo:
  };

  handleDeleteDB = () => {
    elementsDBStore.deleteAll();
    receiptsDBStore.deleteAll();
  };

  handleConfirmation = () => {
    this.setState({ ...this.state, isLoading: true });

    try {
      if (this.state.elementClicked === 'deleteDB') {
        this.handleDeleteDB();
      } else if (this.state.elementClicked === 'importDB') {
        this.handleImportDB();
      }

      // todo: it should reload
      // window.location.reload();
    } catch (err: any) {
      this.setState({
        ...this.state,
        isLoading: false,
        notification: err.message,
      });
    }
  };

  closeConfirmationDialog = () => {
    this.setState({
      ...this.state,
      confirmationTitle: '',
      confirmationMessage: '',
      elementClicked: '',
    });
  };

  closeNotification = () => {
    this.setState({ ...this.state, notification: '' });
  };

  closeDialogs = () => {
    this.setState({ ...this.state, dialogAboutShow: false });
  };

  render() {
    return (
      <>
        {!!this.state.isLoading && <GlobalLoading />}

        <Snackbar
          open={!!this.state.notification}
          message={this.state.notification || ''}
          style={{ textAlign: 'center' }}
          onRequestClose={this.closeNotification}
          autoHideDuration={3000}
        />

        <Dialog
          open={!!this.state.dialogAboutShow}
          title={'Acerca de'}
          actions={[
            <ModalButtonsWrapper>
              <Button type="button" onClick={this.closeDialogs}>
                Cerrar
              </Button>
            </ModalButtonsWrapper>,
          ]}
        >
          <Paragraph>
            <Bold>UserDataPath: </Bold>
            {ElectronStore.getUserDataPath()}
          </Paragraph>
          <Paragraph>
            <Bold>DBBackupFilePath: </Bold>
            {userPreferencesDBStore.getItem(
              DBUserPreferencesKeys.DB_BACKUP_FILEPATH
            ) || '-'}
          </Paragraph>
        </Dialog>

        <Confirmation
          isOpened={!!this.state.confirmationTitle}
          title={this.state.confirmationTitle}
          message={this.state.confirmationMessage}
          onAccept={this.handleConfirmation}
          onCancel={this.closeConfirmationDialog}
        />
        <BigMenu items={items} onItemClick={this.handleBigMenuItemClick} />
      </>
    );
  }
}
