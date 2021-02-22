import React from 'react';
import {decorator} from '../__utilities__/decorator';
import {useCollection, UseCollectionResult} from '.';

export default {
  title: 'react-firebase/firestore/useCollection',
  decorators: [decorator],
};

const collection = 'animals';

type RenderDataProps<Data> = UseCollectionResult<Data>;

const RenderTable: React.FC<RenderDataProps<unknown>> = ({value}) => (
  <>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        {value?.map(([id, data]) => (
          <tr key={id}>
            <td>{id}</td>
            <td>{JSON.stringify(data)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);

export const All: React.FC = () => {
  const result = useCollection(collection);
  return <RenderTable {...result} />;
};

export const WithLimit: React.FC = () => {
  const result = useCollection(collection, {limit: 3});
  return <RenderTable {...result} />;
};

export const WithWhere: React.FC = () => {
  const result = useCollection(collection, {where: [['species', '==', 'dog']]});
  return <RenderTable {...result} />;
};
