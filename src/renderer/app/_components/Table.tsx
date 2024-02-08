import styled from 'styled-components';

export const Table = styled.table`
  width: 100%;
`

export const Thead = styled.thead`
`

export const Tr = styled.tr`
  background: #fff;

  &:nth-child(2n) {
    background-color: #f5f5f5;
  }

  ${(props: any) => props.isActive && `
    background: #ccccde !important;
  `}
`
export const Th = styled.th`
  height: auto;
  padding: 10px 10px;
  white-space: nowrap;
  text-align: left;
  border-left: 1px solid #eee;
  color: #999;
  font-size: 14px;
  border-bottom: 3px solid #eee;
  vertical-align: middle;
`

export const Tbody = styled.tbody`
`

export const Td = Th.extend`
  border-bottom: 0;
  white-space: normal;
  border-left: 0;
  color: #666;
`
