import { useForm } from "react-hook-form";
import AgileMindLogo from "../assets/AgileMindLogo.png";
import EmailInput from "../components/EmailInput";
import TextInput from "../components/TextInput";
import PasswordInput from "../components/PasswordInput";
import SelectInput from "../components/SelectInput";
import { apiClientForUnAuthReq } from "../services/apiService";
import PopupMessage from "../components/PopupMessage";
import Spinner from "../components/Spinner";
import { useState } from "react";
import { roleOptions } from "../services/selectOptions";
import { useNavigate,Link } from "react-router-dom";


export default function RegistrationPage() {
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm();

	const [popupMessage, setPopupMessage] = useState("");
	const [showSpinner, setShowSpinner] = useState(false);
	const navigate = useNavigate();


	function validatePassword(value) {
		const password = watch("password");
		return value === password || "Passwords do not match";
	}


	async function onFormSubmit(data) {
		try {
			setShowSpinner(true);
			const response = await apiClientForUnAuthReq.post("/auth/register", data);
			if (response.status == "200") {
				navigate('/login');
			}
		} catch (e) {
			setPopupMessage(e.response.data.message);
			setTimeout(function () { setPopupMessage("") }, 2000);
			setShowSpinner(false);
		}
	}

	return (
		<div className="grid xl:grid-cols-2 grid-cols-1 pt-24">
			<Spinner showSpinner={showSpinner} />
			<PopupMessage message={popupMessage}></PopupMessage>
			<form
				className="px-8 py-8 mx-16  text-white border rounded-md"
				onSubmit={handleSubmit(onFormSubmit)}
			>
				<h1 className="text-3xl font-bold mb-12 text-center">
					Get Registered
					<br /> With Us
				</h1>
				<div className="grid xl:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4">
					<TextInput
						labelToShow="First Name"
						elementName="firstName"
						placeholder="Enter your first name here"
						register={register("firstName", { required: "Required field" })}
						errorToShow={errors.firstName?.message}
					/>
					<TextInput
						labelToShow="Last Name"
						elementName="lastName"
						placeholder="Enter your last name here"
						register={register("lastName", { required: "Required field" })}
						errorToShow={errors.lastName?.message}
					/>
					<EmailInput
						labelToShow="Email"
						elementName="userEmail"
						placeholder="Enter your mail ID here"
						register={register("userEmail", {
							required: "Required field",
							pattern: {
								value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
								message: "Please enter valid email address",
							},
						})}
						errorToShow={errors.userEmail?.message}
					/>
					<SelectInput
						labelToShow="Role"
						elementName="role"
						options={roleOptions}
						register={register("role", { required: "Required field" })}
						errorToShow={errors.role?.message}
					/>

					<PasswordInput
						labelToShow="Password"
						elementName="password"
						placeholder="Enter your password here"
						supportingText="Password must contain at least 8 letters"
						register={register("password", {
							required: "Required field",
							minLength: {
								value: 8,
								message: "Password should contain atleast 8 character",
							},
						})}
						errorToShow={errors.password?.message}
					/>
					<PasswordInput
						labelToShow="Re-Enter Password"
						elementName="confirmedPassword"
						placeholder="Enter your password here"
						supportingText="Password must contain at least 8 letters"
						register={register("confirmedPassword", {
							required: "Required field",
							minLength: {
								value: 8,
								message: "Password should contain atleast 8 character",
							},
							validate: validatePassword,
						})}
						errorToShow={errors.confirmedPassword?.message}
					/>
				</div>
				<center>
					<button
						className="mt-8 mb-8 w-2/3 bg-cornflower-blue text-meteorite py-2 rounded-full transition duration-200"
						type="submit"
					>
						Register
					</button>
				</center>
				<div className="text-center text-sm">
						Back to
						<Link className="hover:underline" to="/login">
							{" "}
							log in
						</Link>
					</div>
			</form>
			<div className="place-self-center">
				<div className="w-96 h-96 overflow-hidden">
					<img className="" src={AgileMindLogo} />
				</div>
			</div>
		</div>
	);
}
