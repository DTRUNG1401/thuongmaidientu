function ProductManager() {

  const [form, setForm] = useState({
    name: "",
    price: "",
    image: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // 👇 CHÈN ĐOẠN NÀY Ở ĐÂY
  const uploadImage = async(e)=>{

    const formData =
      new FormData();

    formData.append(
      "file",
      e.target.files[0]
    );

    const res =
      await axios.post(
        "http://localhost:5000/api/upload",
        formData
      );

    setForm({
      ...form,
      image:res.data.image
    });
  };

  const addProduct = () => {
    // code thêm sản phẩm
  };

  return (
    <div>

      <input
        name="name"
        onChange={handleChange}
      />

      <input
        name="price"
        onChange={handleChange}
      />

      {/* 👇 DÙNG Ở ĐÂY */}
      <input
        type="file"
        onChange={uploadImage}
      />

      <button onClick={addProduct}>
        Thêm
      </button>

    </div>
  );
}