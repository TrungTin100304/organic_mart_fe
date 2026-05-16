import React, { useState } from "react";
import { Link } from "react-router-dom";
import HeroBanner from "../components/HeroBanner";

const POSTS = [
	{
		id: "p1",
		category: "Công thức",
		time: "5 phút đọc",
		title: "5 Món Salad Giúp Thanh Lọc Cơ Thể Trong Mùa Hè",
		excerpt:
			"Những công thức salad đơn giản, dễ làm từ nguyên liệu hữu cơ sẽ giúp bạn duy trì vóc dáng và cảm thấy nhẹ nhàng hơn.",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDO9ilawfScy6GaSzqrnWE8BxEyNYH0CmPrmVDp_mixicyt60VEim11cBO5bUyoLmuw2eRpCzM7oRFSovkYxANQQDDvXPLxpU_gNyG2GZVj_hCGBf9oFDqrziwxdLeOc7yVYLIqI4vtbJOgx5KsJLQExkLLOiSihGSWMbBPstgwwSWR-BMMIIIUvB35QWwCht0BPvCxvR2bbQ243BChf8NtofJ_lNywpHRXQ-GkBqyhKP3pFEVmtir_OVuxNa3697vlNStyDbvzxOw",
	},
	{
		id: "p2",
		category: "Canh tác",
		time: "8 phút đọc",
		title: "Tại Sao Nên Chọn Phân Bón Hữu Cơ Cho Vườn Nhà?",
		excerpt:
			"Phân bón hữu cơ không chỉ tốt cho cây trồng mà còn cải tạo đất lâu dài. Tìm hiểu cách tự ủ phân tại gia đình.",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuC_-H-gLycpM8CFQBokRc0Vb8TMqcWGdh6MMK0VCa3ktMJvNpD9JE3aL78u10q8wSeatUA4sfcraxT4WNTJUZy3yBEnjfxrSUm2CGxf6spIba9j1_0yCswfsWBDTOgScDzfsl0MeZw3WVK7-kWUKocpN7O03vz9-y2Xd_mbKpNGIQrGSarGCaJdNZshBMxlOl87B3M710XuybYZ97hoMJMQPh6H4I1toiz3fzlR1oRrydZlFN2YtgwrLy-z0gGywt2pChO321Xs32w",
	},
	{
		id: "p3",
		category: "Sống khỏe",
		time: "6 phút đọc",
		title: "Thói Quen Ăn Sáng Lành Mạnh Với Thực Phẩm Sạch",
		excerpt:
			"Bắt đầu ngày mới đầy năng lượng với những lựa chọn thực phẩm hữu cơ thông minh và đầy đủ dưỡng chất cần thiết.",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCCYlbch0RmcdMEuIa9dxuiX1NYX6tglrCrGBaPGkdeNNI7z2Ewx0bY038xNQkOXF8OEmdldiOMrHQH2I9b4cf4OZJUur33yl_BEKoZ-PLocMi-u97z6TAs8-BDtMT96afc3zfeJPuzHUGRe2szlCurbkLuJKNeCC6LrEKJSKHMdV2LsEx3vf9u1TjfUrgYTACKns8fpNKkl-Xkz7lSk481VH0vIFpyGS4AT_msUB65gaLx9esg_ytPzrdImL_Rdkr36Pos-cWvkmw",
	},
	{
		id: "p4",
		category: "Tin tức",
		time: "4 phút đọc",
		title: "Organic Mart Mở Rộng Hệ Thống Cửa Hàng Tại Đà Nẵng",
		excerpt:
			"Tin vui cho khách hàng miền Trung, chúng tôi chính thức có mặt tại Đà Nẵng với nhiều ưu đãi đặc biệt trong tuần lễ khai trương.",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuA_yHVfxePg04XGHxHJUScKbGi-4aCplONl_R3Dayvr8gSnd_g7eMdaa_nntX1js8ZHVTQhioSi5_z7XoiaecBynHCNcwuZIW62iAkXzJV72NPUb8xe-GGzOC3_kZU1qVNPaYx0bNvXDnw8C9gbFSMvrbs3RNMEazpubcMeJQTN7JtUua2mTwRFOLv224Bj-i_oVnCo-jEs3fZ_r8kgdaPUqPCOXTyqNxX2tYmNsRMiAB-jBC0ocNSPyrHcEA9hUJq3C77J6G-vOtU",
	},
];

export default function About() {
	const [email, setEmail] = useState("");
	const [subscribed, setSubscribed] = useState(false);

	function handleSubscribe(e: React.FormEvent) {
		e.preventDefault();
		if (!email) return;
		try {
			localStorage.setItem("organic_mart_newsletter", email);
			setSubscribed(true);
		} catch (err) {
			// ignore
		}
	}

	return (
		<div className="bg-surface text-on-surface min-h-screen">
			<main>
				{/* Reusable Hero Banner */}
				<HeroBanner
					badgeText="Tin nổi bật"
					title={
						<>
							Tương Lai Của Nông Nghiệp Hữu Cơ <br />
							<span className="text-primary-container">Tại Việt Nam</span>
						</>
					}
					subtitle={
						"Khám phá cách các công nghệ mới và phương pháp canh tác bền vững đang thay đổi cách chúng ta tiếp cận thực phẩm sạch hàng ngày, bảo vệ sức khỏe và môi trường."
					}
					primaryLabel="Đọc tiếp"
					primaryTo="#"
				/>

				{/* Main grid */}
				<div className="mt-stack-md md:mt-8 max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-12 gap-gutter pb-stack-lg">
					<section className="md:col-span-9 space-y-stack-lg">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
							{POSTS.map((p) => (
								<article
									key={p.id}
									className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:shadow-lg transition-all group flex flex-col"
								>
									<div className="aspect-[16/10] overflow-hidden">
										<img
											alt={p.title}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
											src={p.image}
										/>
									</div>
									<div className="p-stack-md flex flex-col flex-grow">
										<div className="flex justify-between items-center mb-stack-sm">
											<span className="font-label-lg text-[10px] uppercase text-primary font-bold">
												{p.category}
											</span>
											<span className="font-label-lg text-label-lg text-on-surface-variant flex items-center gap-1">
												<span className="material-symbols-outlined text-[16px]">
													schedule
												</span>{" "}
												{p.time}
											</span>
										</div>
										<h3 className="font-headline-md text-headline-md text-on-surface mb-stack-sm group-hover:text-primary transition-colors">
											{p.title}
										</h3>
										<p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 mb-stack-md">
											{p.excerpt}
										</p>
										<div className="mt-auto">
											<Link
												className="text-primary font-label-lg text-label-lg inline-flex items-center gap-1"
												to="#"
											>
												Xem chi tiết{" "}
												<span className="material-symbols-outlined text-[18px]">
													chevron_right
												</span>
											</Link>
										</div>
									</div>
								</article>
							))}
						</div>

						{/* Pagination */}
						<div className="flex justify-center items-center gap-stack-sm py-stack-lg">
							<button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-all">
								1
							</button>
							<button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-all">
								2
							</button>
							<button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-all">
								3
							</button>
							<span className="px-2">...</span>
							<button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-all">
								<span className="material-symbols-outlined">chevron_right</span>
							</button>
						</div>
					</section>

					{/* Sidebar */}
					<aside className="md:col-span-3 space-y-stack-lg">
						<div className="bg-primary-container/10 p-stack-md rounded-xl border border-primary/20">
							<h4 className="font-headline-md text-headline-md text-primary mb-stack-sm">
								Bản tin sức khỏe
							</h4>
							<p className="font-body-md text-body-md text-on-surface-variant mb-stack-md">
								Nhận bí quyết sống khỏe và ưu đãi mới nhất từ Organic Mart hàng
								tuần.
							</p>
							<form
								onSubmit={handleSubscribe}
								className="flex flex-col gap-stack-sm"
							>
								<input
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full p-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary outline-none font-body-md"
									placeholder="Email của bạn"
									type="email"
								/>
								<button
									type="submit"
									className="bg-primary text-on-primary font-label-lg text-label-lg py-3 rounded-lg hover:bg-primary/90 transition-all"
								>
									{subscribed ? "Đã đăng ký" : "Đăng ký ngay"}
								</button>
							</form>
						</div>

						<div>
							<h4 className="font-headline-md text-headline-md text-on-surface mb-stack-md border-b border-outline-variant pb-2">
								Bài viết phổ biến
							</h4>
							<div className="space-y-stack-md">
								{POSTS.slice(0, 3).map((p) => (
									<Link key={p.id} to="#" className="flex gap-stack-sm group">
										<div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden">
											<img
												alt={p.title}
												className="w-full h-full object-cover"
												src={p.image}
											/>
										</div>
										<div className="flex flex-col">
											<span className="font-label-lg text-[10px] text-primary">
												{p.category}
											</span>
											<h5 className="font-label-lg text-label-lg text-on-surface group-hover:text-primary line-clamp-2 transition-colors">
												{p.title}
											</h5>
										</div>
									</Link>
								))}
							</div>
						</div>

						<div className="relative rounded-xl overflow-hidden aspect-[4/5]">
							<img
								alt="Promotion"
								className="w-full h-full object-cover"
								src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1YZoxM8bmQ46XTnwLCXZ_YZtqk3XVKl0nuVpDoERvStoP_UlyyhH45DrUU8St97cm0bQgWeUDg-NN-Wm7voorPWvIuMlEGw4w1hCpL-XSWiphyZOEKAQT4wUD2yIcr5y2a56f88aJn4IFknwdihq7kFVUTOkpYb1GkGcXIXVmrNhHaYxI7-6F22KxKwNReDFbAb3vKUg74vgmoG0ywN6FEhSE4SsXqBRKi98Jto0XcY6Xy4cyob9fjHo_1rpGLpMD7vV1_55sKvs"
							/>
							<div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-stack-md">
								<span className="text-white font-label-lg text-label-lg mb-1">
									Ưu đãi hôm nay
								</span>
								<h4 className="text-white font-headline-md text-headline-md mb-stack-sm">
									Giảm 20% đơn hàng rau củ đầu tiên
								</h4>
								<Link
									to="/shop"
									className="bg-surface-bright text-primary font-label-lg text-label-lg py-2 rounded-lg hover:bg-white transition-all text-center inline-block w-fit px-4"
								>
									Mua ngay
								</Link>
							</div>
						</div>
					</aside>
				</div>
			</main>
		</div>
	);
}
