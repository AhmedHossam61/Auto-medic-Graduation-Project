export const getOxiDat = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3500/api/v1/oximeter/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch oximeter data");
    }
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const getPaitentsData = async() =>{
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3500/api/v1/users/doctor/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch data");
    }
    return data;
  } catch (error) {
    console.error("Error fetching oximeter data:", error);
    return null;
  }
}


