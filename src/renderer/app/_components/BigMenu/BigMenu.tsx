import React, { MouseEvent } from 'react';
import './BigMenu.scss';

interface ItemData {
  title: string;
  id: string;
}

interface ItemProps extends ItemData {
  onItemClick: Props['onItemClick'];
}

export interface Props {
  items: ItemData[],
  onItemClick: (id: string) => void;
}

function BigMenuItem(props: ItemProps) {
  const handleItemClick = () => {
    props.onItemClick(props.id);
  };

  return (
    <div className="bigmenu__item" onClick={handleItemClick}>
      {props.title}
    </div>
  );
}

export default function BigMenu(props: Props) {
  return (
    <div className='bigmenu'>
      {props.items.map((el, i) =>
        <BigMenuItem {...el} key={el.id} onItemClick={props.onItemClick} />
      )}
    </div>
  );
}

