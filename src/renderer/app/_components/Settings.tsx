import React from 'react';
// https://github.com/ThorstenHans/ngx-electron/issues/71#issuecomment-955324149
// import { remote } from 'electron'
import remote from '@electron/remote';
import fs from 'fs-extra';
import { Dialog, Snackbar } from 'material-ui';
import styled from 'styled-components';
import BigMenu from './BigMenu/BigMenu';
import Button from './Button/Button';
import ModalButtonsWrapper from './ModalButtonsWrapper';

import Confirmation from '../_components/Confirmation';
import GlobalLoading from '../_components/GlobalLoading';
import { DBElementBiggestIdKeys, DBElementKeys } from '../_models';

// @ts-ignore
import ElectronStore from '../../../_db/electronStore';
import {
  elementsDBStore,
  receiptsDBStore,
  userPreferencesDBStore,
  // @ts-ignore
} from '../../../_singletons/dbInstances';

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

  handleImportDB = () => {
    // todo:
    const filepath: any = remote.dialog.showOpenDialog({
      properties: ['openFile'],
      defaultPath: userPreferencesDBStore.getItem(
        DBUserPreferencesKeys.DB_BACKUP_FILEPATH
      ),
    });

    if (filepath && filepath[0]) {
      const db = fs.readJSONSync(filepath[0]);

      receiptsDBStore.deleteAll();
      receiptsDBStore.setItem(
        DBElementKeys.RECEIPTS,
        db[DBElementKeys.RECEIPTS]
      );
      receiptsDBStore.setItem(
        DBElementBiggestIdKeys.RECEIPTS,
        db[DBElementBiggestIdKeys.RECEIPTS]
      );

      elementsDBStore.deleteAll();
      elementsDBStore.setItem(
        DBElementKeys.PRODUCTS,
        db[DBElementKeys.PRODUCTS]
      );
      elementsDBStore.setItem(
        DBElementBiggestIdKeys.PRODUCTS,
        db[DBElementBiggestIdKeys.PRODUCTS]
      );
      elementsDBStore.setItem(
        DBElementKeys.CATEGORIES,
        db[DBElementKeys.CATEGORIES]
      );
      elementsDBStore.setItem(
        DBElementBiggestIdKeys.CATEGORIES,
        db[DBElementBiggestIdKeys.CATEGORIES]
      );
      elementsDBStore.setItem(DBElementKeys.FLAVORS, db[DBElementKeys.FLAVORS]);
      elementsDBStore.setItem(
        DBElementBiggestIdKeys.FLAVORS,
        db[DBElementBiggestIdKeys.FLAVORS]
      );

      window.location.reload();
    }
  };

  handleExportDB = () => {
    // todo:
    let filepath: any = remote.dialog.showSaveDialog({
      defaultPath: userPreferencesDBStore.getItem(
        DBUserPreferencesKeys.DB_BACKUP_FILEPATH
      ),
    });

    if (filepath) {
      if (!/\.json$/.test(filepath)) {
        filepath += '.json';
      }

      userPreferencesDBStore.setItem(
        DBUserPreferencesKeys.DB_BACKUP_FILEPATH,
        filepath
      );
      fs.outputJSONSync(filepath, {
        ...receiptsDBStore.store,
        ...elementsDBStore.store,
      });
    }
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

      window.location.reload();
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
