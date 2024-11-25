import { NextResponse } from 'next/server';
import { dbGAP2566 } from '@/condb/db';

export async function GET() {
  try {
    const [rows] = await dbGAP2566.query(`
      SELECT 
      g.Group_id,
      g.Group_name, 
      g.Group_district, 
      g.Group_province, 
      MAX(p.Member_id) AS max_member_id,
      g.Summary,
      Certification_code1,
      Certification_code2,
      g.Certification_file 
    FROM 
      \`group\` g
    LEFT JOIN 
      \`plotmember\` p ON g.Group_id = p.Group_id
    GROUP BY 
      g.Group_id,
      g.Group_name, 
      g.Group_district, 
      g.Group_province
      ORDER BY g.Group_id;
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Query error:', error.message);
    return NextResponse.error();
  }
}
