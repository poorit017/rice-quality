import { NextResponse } from 'next/server';
import { dbORG2566 } from '@/condb/db';

export async function GET() {
    try {
        const [rows] = await dbORG2566.query(`
SELECT
    g.group_id,
    g.group_name,
    g.group_district,
    g.group_province,
    g.certification_code,
    g.Certification_file, 
    COUNT(DISTINCT p.member) AS member_count,
    COUNT(p.plot) AS total_plots,
    SUM(p.planting_area) AS total_acres,
    COUNT(DISTINCT CASE WHEN g.certification_code != '-' THEN g.group_id ELSE NULL END) AS passed_group,
    COUNT(DISTINCT CASE WHEN p.ics_result = 'ผ่าน' AND g.certification_code != '-' THEN p.member ELSE NULL END) AS passed_members,
    COUNT(CASE WHEN p.ics_result = 'ผ่าน' AND g.certification_code != '-' THEN p.plot ELSE NULL END) AS passed_plots,
    SUM(CASE WHEN p.ics_result = 'ผ่าน' AND g.certification_code != '-' THEN p.evaluation_passed ELSE 0 END) AS passed_acres,
    COUNT(DISTINCT CASE WHEN g.certification_code = '-' THEN g.group_id ELSE NULL END) AS failed_group,
     COUNT(DISTINCT CASE 
        WHEN g.certification_code = '-' THEN p.member
        WHEN p.ics_result = 'ไม่ผ่าน' 
             AND p.member NOT IN (
                SELECT member
                FROM plotinfo p2
                WHERE p2.group_id = p.group_id
                  AND p2.ics_result = 'ผ่าน'
            )
        THEN p.member
        ELSE NULL 
    END) AS failed_members,
    COUNT(CASE WHEN p.ics_result = 'ไม่ผ่าน' OR g.certification_code = '-' THEN p.plot ELSE NULL END) AS failed_plots,
    SUM(CASE WHEN g.certification_code = '-' THEN p.evaluation_failed + p.evaluation_passed WHEN g.certification_code != '-' THEN p.evaluation_failed ELSE 0 END) AS failed_acres 
    
FROM 
    plotinfo p 
JOIN 
    groupinfo g 
ON 
    p.group_id = g.group_id
GROUP BY 
    g.group_id, g.group_name, g.group_district, g.group_province
ORDER BY
    g.group_id;
        `);

        return NextResponse.json(rows);
    } catch (error) {
      console.error('Query error:', error.message);
      return NextResponse.error();
    }
    }
    