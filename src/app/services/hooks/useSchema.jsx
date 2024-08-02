import {useQuery} from '@tanstack/react-query';
import {API_QUERY} from 'app/constant/query';
import {BaseService} from '../api/base.service';

export const schemaQuery = () => {
  return {
    queryKey: [API_QUERY.GET_SCHEMA],
    queryFn: async () => BaseService.get('api/static/action-schema.json'),
    meta: {type: 'action schema', id: '', method: 'read'},
  };
};

export const useSchema = props => {
  return useQuery(schemaQuery(props));
};
