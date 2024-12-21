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