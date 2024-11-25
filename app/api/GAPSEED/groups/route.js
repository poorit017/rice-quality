import { NextResponse } from 'next/server';
import { dbGAPSEED2566 } from '@/condb/db';

export async function GET() {
    try {
        const [rows] = await dbGAPSEED2566.query(`
      SELECT 
        g.group_id,
        g.group_name, 
        g.district, 
        g.province, 
        MAX(p.member) AS max_member_id,
        g.certification_code,
        g.Certification_file
      FROM 
        \`group_info\` g
      LEFT JOIN 
        \`plot_info\` p ON g.group_id = p.group_id  
      GROUP BY 
        g.group_id,
        g.group_name,   
        g.district, 
        g.province
        order by g.group_id
    `);

    return NextResponse.json(rows);
} catch (error) {
  console.error('Query error:', error.message);
  return NextResponse.error();
}
}

