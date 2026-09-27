import { authService } from "@/services/auth.services";

const GetMe = async () => {
  const messenger = await authService.getMe();

  console.log("messenger:", messenger);
  return (
    <div>
      <p>GetMe {messenger?.user?.email}</p>
      {/* ✅ Lồng component Show vào bên trong JSX trả về */}
    </div>
  );
};

export default GetMe;

// ✅ Định nghĩa Props đúng chuẩn TypeScript
interface ShowProps {
  name: any;
}

const Show = ({ name }: ShowProps) => {
  // Hoặc hiển thị tên thực tế: return <div>{name?.username || "khang"}</div>;
  return <div>khang {name}</div>;
};
