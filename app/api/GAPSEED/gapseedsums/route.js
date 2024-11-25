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
                g.Certification_file,
                g.certification_code,
                COUNT(DISTINCT p.member) AS member_count,
                COUNT(p.plot) AS total_plots,
                SUM(p.area) AS total_acres,
                COUNT(DISTINCT CASE WHEN g.certification_code != 'ไม่ผ่าน' THEN g.group_id ELSE NULL END) AS passed_group,
                COUNT(DISTINCT CASE WHEN p.summary = 'ผ่าน'AND g.certification_code != 'ไม่ผ่าน' THEN p.member ELSE NULL END) AS passed_members,
                COUNT(CASE WHEN p.summary = 'ผ่าน'AND g.certification_code != 'ไม่ผ่าน' THEN p.plot ELSE NULL END) AS passed_plots,
                SUM(CASE WHEN p.summary = 'ผ่าน' AND g.certification_code != 'ไม่ผ่าน' THEN p.area ELSE 0 END) AS passed_acres,
                COUNT(DISTINCT CASE WHEN g.certification_code = 'ไม่ผ่าน' THEN g.group_id ELSE NULL END) AS failed_group,
                COUNT(DISTINCT CASE 
                WHEN g.certification_code = 'ไม่ผ่าน' THEN p.member
                WHEN p.summary = 'ไม่ผ่าน' 
                AND p.member NOT IN ( 
                SELECT member FROM plot_info p2
                WHERE p2.group_id = p.group_id AND p2.summary = 'ผ่าน')THEN p.member ELSE NULL 
                END)AS failed_members,
                COUNT(CASE  WHEN g.certification_code = 'ไม่ผ่าน' THEN p.plot WHEN p.summary = 'ไม่ผ่าน' THEN p.plot ELSE NULL END) AS failed_plots,
                SUM(CASE WHEN g.certification_code = 'ไม่ผ่าน' THEN p.area WHEN  p.summary = 'ไม่ผ่าน' THEN p.area ELSE 0 END) AS failed_acres
            FROM 
                plot_info p 
            JOIN 
                group_info g 
            ON 
                p.group_id = g.group_id
            GROUP BY 
                g.group_id, g.group_name, g.district, g.province
            ORDER BY
                g.group_id
        `);
 
    return NextResponse.json(rows);
} catch (error) {
  console.error('Query error:', error.message);
  return NextResponse.error();
}
}
