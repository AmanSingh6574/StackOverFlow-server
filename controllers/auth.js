import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import users from "../models/auth.js";
import UAParser from "ua-parser-js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res
        .status(404)
        .json({ message: "User with the details already exist!!" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await users.create({
      name,
      email,
      password: hashedPassword,
    });
    const parser = new UAParser();
    const userAgent = req.headers["user-agent"];
    const userAgentInfo = parser.setUA(userAgent).getResult();

    const operatingSystem = `${userAgentInfo.os.name} ${userAgentInfo.os.version}`;

    newUser.loginHistory.push({
      ipAddress: req.ip,
      browser: userAgentInfo.browser.name,
      operatingSystem,
      timestamp: new Date(),
    });

    await newUser.save();
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ result: newUser, token });
  } catch (err) {
    console.log(err);
    res.status(500).json("Something went wrong!!");
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await users.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "No User exists with the given credentials!!!" });
    }
    // console.log(existingUser) ;
    const isPassCrt = await bcrypt.compare(password, existingUser.password);
    if (!isPassCrt) {
      return res.status(400).json({ message: "Invalid credentials!!!" });
    }

    const parser = new UAParser();
    const userAgent = req.headers["user-agent"];
    const userAgentInfo = parser.setUA(userAgent).getResult();
    // console.log(userAgentInfo);

    const operatingSystem = `${userAgentInfo.os.name} ${userAgentInfo.os.version}`;

    existingUser.loginHistory.push({
      ipAddress: req.ip,
      browser: userAgentInfo.browser.name,
      operatingSystem,
      timestamp: new Date(),
    });

    await existingUser.save();

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ result: existingUser, token });
  } catch (err) {
    console.log(err);
    res.status(500).json("Something went wrong!!");
  }
};
