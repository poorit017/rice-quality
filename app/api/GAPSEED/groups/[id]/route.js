// app/api/groups/[id]/route.js

import { NextResponse } from 'next/server';
import { dbGAPSEED2566 } from '@/condb/db';

export async function GET(request, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
  }


  try {
    const [groupInfo] = await dbGAPSEED2566.query(`
      SELECT 
        group_id, 
        group_name, 
        group_no, 
        moo, 
        sub_district, 
        district,  -- Added missing comma here
        province, 
        titie, 
        first_name, 
        last_name, 
        phone, 
        certification_code, 
        Certification_file
      FROM 
        group_info 
      WHERE 
        group_id = ?
    `, [id]);

    // Fetch plot info based on group_id
    const [plotInfo] = await dbGAPSEED2566.query(`
      SELECT 
        idplot, 
        group_id, 
        member, 
        plot, 
        title, 
        first_name, 
        last_name, 
        area, 
        rice_variety, 
        seed_class, 
        ics_evaluation_result, 
        summary, 
        note 
      FROM 
        plot_info 
      WHERE 
        group_id = ?
    `, [id]);
    
    if (groupInfo.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({
      group: groupInfo[0],
      plotinfo: plotInfo,
    });
  } catch (error) {
    console.error('Database connection or query error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
