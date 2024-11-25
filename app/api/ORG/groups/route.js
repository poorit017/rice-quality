import { NextResponse } from 'next/server';
import { dbORG2566 } from '@/condb/db';

export async function GET() {
  try {
    const [rows] = await dbORG2566.query(`
      SELECT 
        g.group_id ,
        g.group_name , 
        g.group_district , 
        g.group_province , 
        MAX(p.member) AS max_member_id,
        g.certification_code,
        g.Certification_file 
      FROM 
        \`groupinfo\` g
      LEFT JOIN 
        \`plotinfo\` p ON g.group_id = p.group_id
      GROUP BY 
        g.group_id,
        g.group_name, 
        g.group_district, 
        g.group_province, 
        g.certification_code
        order by g.group_id ;
      
    `);

    return NextResponse.json(rows);
} catch (error) {
  console.error('Query error:', error.message);
  return NextResponse.error();
}
}
