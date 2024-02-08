import React from 'react';
import './Form.scss';

export function Form(props: any) {
  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    props.onSubmit();
  }

  return (
    <form className='form' onSubmit={handleSubmit}>
      {props.children}
    </form>
  )
}

export function FormRow(props: any) {
  return (
    <div style={props.style} className={'form__row ' + (props.className || '') }>
      {props.children}
    </div>
  );
}
