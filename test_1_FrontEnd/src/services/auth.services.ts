import services from ".";

export const loginInstructor = async (username: string, password: string) => {
  const res = await services.post("/Authorization", {
    Username: username,  // Change to match backend casing
    Password: password,  // Change to match backend casing
  });

  services.defaults.headers.common["Authorization"] = `Bearer ${res.data}`;

  return res.data;
};

export const getProfile = async (id: string) => {
    const res = await services.get(`/profile/${id}`);
  
    return res.data;
};

export const fetchAllEmployees = async (page: number, size: number) => {
  const res = await services.get(`/allEmployees?page=${page}&size=${size}`);
  return res.data;
};

export interface User {
  ID: string;
  Name: string;
  EmailAddress: string;
  Division: string;
  Position: string;
}

export const updateProfile = async (userData: User) => {
  const res = await services.put(`/editProfile/${userData.ID}`, userData);
  return res.data;
};

export interface newUser {
  Name: string;
  Username: string;
  Password: string;
  EmailAddress: string;
  Division: string;
  Position: string;
  IsAdmin: boolean;
}

export const addProfile = async (userData: newUser) => {
  const res = await services.post(`/addProfile`, userData);
  return res.data;
};

export const deleteProfile = async (id: string) => {
  const res = await services.delete(`/deleteProfile/${id}`);

  return res.data;
};