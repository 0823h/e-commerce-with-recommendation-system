import { Client } from '@elastic/elasticsearch';
import { config } from 'dotenv';

config();
const es_client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

export default es_client;