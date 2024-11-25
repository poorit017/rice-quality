import { NextResponse } from 'next/server';
import { dbGAP2566 } from '@/condb/db';

export async function GET(req, { params }) {
  const { id } = params; 
  if (!id) {
    return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
  }

  try {
    const [groupRows] = await dbGAP2566.query(
      `
      SELECT 
        Group_id,
        Group_name,
        Group_house_number, 
        Group_village, 
        Group_sub_district,
        Group_district, 
        Group_province, 
        Group_postal_code,
        Group_leader, 
        Group_leader_phone,
        Certification_code1,
        Certification_code2,
        Summary,
        Certification_file
      FROM 
        \`group\` 
      WHERE 
        Group_id = ?  
      `,
      [id]
    );

    const [plotMemberRows] = await dbGAP2566.query(
      `
      SELECT 
        Plotmember_id,
        Member_id,
        Plot_id,
        Title,
        Member_name,
        Member_surname,
        Planted_area,
        Rice_variety,
        Plot_coordinates_x,
        Plot_coordinates_y,
        Plot_inspection_result,
        Failure_reason
      FROM 
        \`plotmember\` 
      WHERE 
        Group_id = ?
      `,
      [id]
    );

    if (groupRows.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({ group: groupRows[0], plotMembers: plotMemberRows });
  } catch (error) {
    console.error('Query error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
