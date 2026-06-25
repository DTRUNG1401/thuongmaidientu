import { useEffect, useState } from "react";

function UserManager() {

  const [users, setUsers] = useState([]);

  useEffect(() => {

    const data =
      JSON.parse(
        localStorage.getItem("users")
      ) || [];

    setUsers(data);

  }, []);

  return (
    <div>

      <h1>Quản Lý Người Dùng</h1>

      <table>

        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody>

          {users.map((user,index)=>(
            <tr key={index}>

              <td>{index+1}</td>

              <td>{user.email}</td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default UserManager;