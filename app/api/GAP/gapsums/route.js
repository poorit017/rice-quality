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
        g.Certification_file,
        g.Summary,
        COUNT(DISTINCT pm.Member_id) AS member_count,
        COUNT(pm.Plot_id) AS total_plots,
        SUM(pm.Planted_area) AS total_acres,
        COUNT(DISTINCT CASE WHEN g.Summary = 'ผ่าน' THEN g.Group_id ELSE NULL END) AS passed_group,
        COUNT(DISTINCT CASE WHEN pm.Plot_inspection_result = 'ผ่าน' AND g.Summary = 'ผ่าน' THEN pm.Member_id ELSE NULL END) AS passed_members,
        COUNT(CASE WHEN pm.Plot_inspection_result = 'ผ่าน' AND g.Summary = 'ผ่าน' THEN pm.Plot_id ELSE NULL END) AS passed_plots,
        SUM(CASE WHEN pm.Plot_inspection_result = 'ผ่าน' AND g.Summary = 'ผ่าน' THEN pm.Planted_area ELSE 0 END) AS passed_acres,
        COUNT(DISTINCT CASE WHEN g.Summary = 'ไม่ผ่าน' THEN g.Group_id ELSE NULL END) AS failed_group,
        COUNT(DISTINCT CASE 
            WHEN g.Summary = 'ไม่ผ่าน' THEN pm.Member_id
            WHEN pm.Plot_inspection_result = 'ไม่ผ่าน' 
                AND pm.Member_id NOT IN (
                    SELECT Member_id
                    FROM plotmember pm2
                    WHERE pm2.Group_id = g.Group_id
                      AND pm2.Plot_inspection_result = 'ผ่าน'
                )
            THEN pm.Member_id
            ELSE NULL 
        END) AS failed_members,
        COUNT(CASE WHEN g.Summary = 'ไม่ผ่าน' OR pm.Plot_inspection_result = 'ไม่ผ่าน' THEN pm.Plot_id ELSE NULL END) AS failed_plots,
        SUM(CASE WHEN g.Summary = 'ไม่ผ่าน' OR pm.Plot_inspection_result = 'ไม่ผ่าน' THEN pm.Planted_area ELSE 0 END) AS failed_acres
      FROM 
        plotmember pm 
      JOIN 
        \`group\` g  
      ON 
        pm.Group_id = g.Group_id
      GROUP BY 
        g.Group_name,
        g.Group_id,
        g.Group_district, 
        g.Group_province  
      ORDER BY g.Group_id
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Query error:', error.message);
    return NextResponse.error();
  }
}

