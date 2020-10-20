/*
      rank_uuid UUID DEFAULT uuid_generate_v4(),
      rank_name VARCHAR(50) UNIQUE NOT NULL,
      priority SMALLINT UNIQUE NOT NULL,
      pay_grade VARCHAR(4) NOT NULL,
      abbreviation VARCHAR(5) NOT NULL,
      PRIMARY KEY(rank_uuid)
*/
export interface Rank {
  rank_uuid: string;
  rank_name: string;
  priority: number;
  pay_grade: string;
  abbreviation: string;
}