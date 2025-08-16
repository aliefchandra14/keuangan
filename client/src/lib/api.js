const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api/v1`;

const handleFetchError = async (response) => {
  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.msg || "Network response was not ok");
  }
  return response;
};

export const getAll = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/dashboard`,
      {
        method: "GET",
        credentials: "include", // Untuk menyertakan cookie session jika perlu
      }
    );

    // Cek apakah ada error dalam response
    await handleFetchError(response);

    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};
export const getGoal = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/dashboard/goal`,
      {
        method: "GET",
        credentials: "include", // Untuk menyertakan cookie session jika perlu
      }
    );

    // Cek apakah ada error dalam response
    await handleFetchError(response);

    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};
export const createGoal = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/goal`, {
      method: "POST",
      credentials: "include", // kalau pakai cookie/session
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.msg || "Gagal membuat goal");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating goal:", error);
    throw error;
  }
};
export const deleteGoal = async (id) => {
  try {
    const response = await fetch(
      `${BASE_URL}/dashboard/goal/${id}`,
      {
        method: "DELETE",
        credentials: "include", // Untuk menyertakan cookie session jika perlu
        headers: {
        Accept: "application/json",
      },
    }
    );

    // Cek apakah ada error dalam response
    await handleFetchError(response);

    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};
export const getRecord = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/dashboard/record`,
      {
        method: "GET",
        credentials: "include", // Untuk menyertakan cookie session jika perlu
      }
    );

    // Cek apakah ada error dalam response
    await handleFetchError(response);

    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};
export const createRecord = async (data) => {
  console.log(data);
  try {
    const response = await fetch(`${BASE_URL}/dashboard/record`, {
      method: "POST",
      credentials: "include", // Untuk menyertakan cookie session jika perlu
      headers: {
        "Content-Type": "application/json", // ✅ wajib biar backend ngerti
        Accept: "application/json",
      },
      body: JSON.stringify(data), // ✅ ubah object jadi JSON
    });

    // Cek apakah ada error dalam response
    await handleFetchError(response);

    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const deleteRecord = async (id) => {
  try {
    const response = await fetch(
      `${BASE_URL}/dashboard/record/${id}`,
      {
        method: "DELETE",
        credentials: "include", // Untuk menyertakan cookie session jika perlu
        headers: {
        Accept: "application/json",
      },
    }
    );

    // Cek apakah ada error dalam response
    await handleFetchError(response);

    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};
export const getOutcome = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/dashboard/outcome`,
      {
        method: "GET",
        credentials: "include", // Untuk menyertakan cookie session jika perlu
      }
    );

    // Cek apakah ada error dalam response
    await handleFetchError(response);

    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};
export const createOutcome = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/outcome`, {
      method: "POST",
      credentials: "include", // Jika pakai cookie session
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Cek apakah ada error dalam response
    await handleFetchError(response);

    return await response.json();
  } catch (error) {
    console.error("Error creating outcome:", error);
    throw error;
  }
};

export const deleteOutcome = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/outcome/${id}`, {
      method: "DELETE",
      credentials: "include", // Jika pakai cookie session
      headers: {
        Accept: "application/json",
      },
    });

    // Cek apakah ada error dalam response
    await handleFetchError(response);

    return await response.json();
  } catch (error) {
    console.error("Error deleting outcome:", error);
    throw error;
  }
};
