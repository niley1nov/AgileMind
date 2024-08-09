import { useState } from "react";
import { useForm } from "react-hook-form";
import AgileMindLogo from "../assets/AgileMindLogo.png";
import EmailInput from "../components/EmailInput";
import PasswordInput from "../components/PasswordInput";
import { apiClientForUnAuthReq } from "../services/apiService";
import { Link, useNavigate } from "react-router-dom";
import PopupMessage from "../components/PopupMessage";
import Spinner from "../components/Spinner";

export default function LoginPage() {
	const { register, handleSubmit, formState: { errors } } = useForm();
	const [popupMessage, setPopupMessage] = useState("");
	const [showSpinner, setShowSpinner] = useState(false);
	const navigate = useNavigate();

	async function onLoginFormSubmit(data) {
		try {
			setShowSpinner(true);
			const response = await apiClientForUnAuthReq.post("/auth/login", data);
			if (response.status == "200") {
				console.log(JSON.stringify(response));
				localStorage.setItem("token", response.data.token);
				navigate('/');
			}
		} catch (e) {
			setPopupMessage(e.response.data.message);
			setTimeout(function () { setPopupMessage("") }, 2000);
			setShowSpinner(false);
		}

		apiClientForUnAuthReq
			.post("/auth/login", data)
			.then(function (response) {
				if (response.status == "200") {
					localStorage.setItem("token", response.data.token);
				}
			});
	}

	return (
		<div className="grid md:grid-cols-2 grid-cols-1 pt-24">
			<Spinner showSpinner={showSpinner} />
			<PopupMessage message={popupMessage}></PopupMessage>
			<div>
				<form className="p-8 mx-28 text-white" onSubmit={handleSubmit(onLoginFormSubmit)}>
					<h1 className="text-3xl font-bold mb-6 text-center">
						Let’s Get You
						<br /> Logged In
					</h1>
					<EmailInput
						className="mb-4"
						labelToShow="Email"
						elementName="userEmail"
						placeholder="Enter your mail ID here"
						register={register("userEmail", { required: "Required field", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter valid email address", } })}
						errorToShow={errors.userEmail?.message}
					/>
					<PasswordInput
						className="mb-6"
						labelToShow="Password"
						elementName="password"
						placeholder="Enter your password here"
						supportingText="Password must contain at least 8 letters"
						register={register("password", { required: "Required field", minLength: { value: 8, message: "Password should contain atleast 8 character" } })}
						errorToShow={errors.password?.message}
					/>
					<div className="mb-4 text-center">
						<a className="text-sm hover:underline">
							Forgot Password?
						</a>
					</div>
					<center>
						<button
							type="submit"
							className="w-2/3 bg-cornflower-blue text-meteorite py-2 rounded-full transition duration-200 mb-8"
						>
							Log In
						</button>
					</center>
					<div className="text-center text-sm">
						Don't have an account?
						<Link className="hover:underline" to="/register">
							{" "}
							sign up
						</Link>
					</div>
				</form>
			</div>
			<div className="place-self-center">
				<div className="w-96 h-96 overflow-hidden">
					<img className="" src={AgileMindLogo} />
				</div>
			</div>
		</div>
	);
}
