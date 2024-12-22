import services from ".";

export const postAttendance = async (id: string, date: string, hour: string, file: File ) => {
    try {
        const formData = new FormData();
        formData.append('EmployeeID', id);
        formData.append('Date', date); 
        formData.append('Hour', hour); 
        formData.append('File', file, file.name);
    
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        const response = await services.post('/PostAttendance', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', 
          },
        });
    
        return response.data;
      } catch (error) {
        console.error('Error posting attendance:', error);
        throw new Error('Failed to post attendance');
      }
};

export const employeeAttendanceLog = async (id: string) => {
  try {
    const res = await services.get(`/employeeAttendanceLog/${id}`);

    return res.data;

  }catch(error) {
    console.error(`Error getting employee's attendance log:`, error);
    throw new Error('Failed to get attendance log');
  }
}
