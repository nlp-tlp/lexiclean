import {
  Button,
  IconButton,
  Typography,
  Stack,
  Container,
  Box,
  Grid,
  Paper,
  Link as MuiLink,
  Skeleton,
  useMediaQuery,
  alpha,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import GitHubIcon from "@mui/icons-material/GitHub";
import ThemeToggleButton from "../../shared/components/Layout/ThemeToggleButton";
import BrandToolbar from "../../shared/components/Layout/BrandToolbar";
import { useContext, useState } from "react";
import { ThemeContext } from "../../shared/context/ThemeContext";
import { docsUrl } from "../../shared/constants/misc";
import { useAuth } from "../../shared/context/AuthContext";
import { useAuthRedirect } from "../../shared/hooks/useAuthRedirect";
import { useNavigate } from "react-router-dom";

export const featureContent = [
  {
    title: "Elevate & Protect Your Data",
    content:
      "Boost your data’s quality and safeguard privacy with LexiClean. Our tool combines advanced normalisation and tagging capabilities to refine your text data meticulously, ensuring precision and protection effortlessly.",
  },
  {
    title: "Collaboration Meets Innovation",
    content:
      "Embrace collaborative intelligence with LexiClean. Our platform empowers you to join forces with peers, enhancing data accuracy and unveiling deep insights, all within a shared, innovative workspace.",
  },
  {
    title: "Empowering the Future, Openly",
    content:
      "Commitment to open-source is at our core. LexiClean invites you to refine text quality and protect sensitive data with full confidence, leveraging our transparent, community-driven solutions in your own environment.",
  },
  {
    title: "Machine Learning Ready",
    content:
      "Streamline your annotation tasks with LexiClean’s OpenAI integration. Access annotated datasets effortlessly, readying your machine learning models for the future, faster and more efficiently.",
  },
];

const Landing = () => {
  return (
    <Box
      data-testid="landing"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "background.light",
      }}
    >
      <Container component="main" maxWidth="lg" sx={{ flex: 1 }}>
        <Header />
        <MainContent />
      </Container>
      <Footer />
    </Box>
  );
};

export const ActionButton = ({ size = "medium" }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return isAuthenticated ? (
    <Button
      id="action-button-authenticated"
      data-testid="action-button-authenticated"
      variant="contained"
      component={Link}
      to="/projects"
      size={size}
      disableElevation
      endIcon={<ArrowForwardIosIcon />}
    >
      Enter
    </Button>
  ) : (
    <Button
      variant="contained"
      size={size}
      disableElevation
      onClick={() => navigate("/auth?option=signup")}
      data-testid="action-button-unauthenticated"
    >
      Get Started
    </Button>
  );
};

export const Header = () => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const { logoutWithRedirect } = useAuthRedirect();

  return (
    <Box
      data-testid="header"
      display="flex"
      p="1rem 0rem"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        backgroundColor: alpha(theme.palette.background.light, 0.95),
      }}
    >
      <BrandToolbar />
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        id="header-actions"
      >
        {/* <Button size="small">Documentation</Button> */}
        <IconButton color="inherit" disabled>
          <GitHubIcon />
        </IconButton>
        <ThemeToggleButton />
        <Button
          id={`header-${isAuthenticated ? "logout" : "login"}-button`}
          size="small"
          onClick={
            isAuthenticated
              ? () => logoutWithRedirect()
              : () => navigate("/auth?option=login")
          }
        >
          {isAuthenticated ? "Logout" : "Login"}
        </Button>
        <ActionButton size={"small"} />
      </Stack>
    </Box>
  );
};

export const MainContent = () => {
  const { mode } = useContext(ThemeContext);
  const [imageLoaded, setImageLoaded] = useState(false);
  const matches = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const imagePath = import.meta.env.VITE_PUBLIC_URL || "/public";
  const imageUrl = `${imagePath}/static/annotation_interface_${mode}.png`;

  return (
    <Box
      data-testid="main-content"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        flex: 1,
        my: { xs: "72px", sm: "64px" },
        overflow: "auto",
      }}
    >
      <Grid container spacing={2} alignItems="center" data-testid="main-grid">
        <Grid
          container
          item
          xs={12}
          spacing={4}
          direction="row"
          data-testid="content-row"
        >
          <Grid item lg={4} md={12} xs={12} data-testid="left-column">
            <Stack
              direction="column"
              spacing={4}
              sx={{ textAlign: { xs: "center", md: "center", lg: "left" } }}
              data-testid="text-stack"
            >
              <Typography variant="h3" gutterBottom data-testid="main-heading">
                Unlock the Full Potential of Your NLP Data!
              </Typography>
              <Typography
                fontSize={16}
                gutterBottom
                color="text.secondary"
                data-testid="main-subtext"
              >
                Are dirty texts jamming your NLP pipelines? Concerned about
                sensitive information lurking in your data? Say no more!
                LexiClean is here to support your lexical normalisation and
                entity tagging projects, offering a powerful solution to refine
                and secure your data effortlessly.
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
                data-testid="action-buttons"
              >
                <ActionButton />
                <Button
                  variant="outlined"
                  as={Link}
                  to={docsUrl}
                  sx={{ textDecoration: "none" }}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="find-out-more-button"
                >
                  Find Out More
                </Button>
              </Box>
            </Stack>
          </Grid>
          <Grid item lg={8} md={12} xs={12} data-testid="right-column">
            <Paper
              sx={{ borderRadius: 2 }}
              elevation={4}
              data-testid="image-paper"
            >
              {!matches && (
                <>
                  {!imageLoaded && (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      sx={{ paddingTop: "56.25%" }} // Aspect ratio of 16:9
                      data-testid="image-skeleton"
                    />
                  )}
                  <Box
                    component="img"
                    sx={{
                      display: imageLoaded ? "block" : "none",
                      maxWidth: "100%",
                      borderRadius: "inherit",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                    src={imageUrl}
                    alt="Annotation Interface"
                    onLoad={() => setImageLoaded(true)}
                    id="main-image"
                    data-testid="main-image"
                  />
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
        <Grid
          item
          container
          md={12}
          xs={12}
          mt={4}
          spacing={4}
          sx={{ display: "flex", alignItems: "stretch" }}
          data-testid="features-grid"
        >
          <Features features={featureContent} />
        </Grid>
      </Grid>
    </Box>
  );
};

export const Features = ({ features }) => {
  return features.map((feature, index) => (
    <Grid
      id={`main-feature-${index}`}
      data-testid={`main-feature-${index}`}
      item
      xs={12}
      lg={3}
      md={6}
      key={`feature-${index}`}
      sx={{ display: "flex" }}
    >
      <Paper
        sx={{
          width: "100%",
          p: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          borderRadius: 2,
          textAlign: "center",
        }}
        variant="outlined"
      >
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          data-testid={`main-feature-${index}-title`}
        >
          {feature.title}
        </Typography>
        <Typography
          variant="body2"
          data-testid={`main-feature-${index}-content`}
        >
          {feature.content}
        </Typography>
      </Paper>
    </Grid>
  ));
};

export const Footer = () => {
  return (
    <Box
      component="footer"
      data-testid="footer"
      sx={{
        py: 2,
        px: 2,
        mt: "auto",
        backgroundColor: "background.paper",
        textAlign: "center",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1">
          <MuiLink
            data-testid="footer-privacy-policy"
            href={`${docsUrl}/privacy-policy`}
            color="primary"
            underline="hover"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </MuiLink>
          {" | "}
          <MuiLink
            data-testid="footer-terms-and-conditions"
            href={`${docsUrl}/terms-and-conditions`}
            color="primary"
            underline="hover"
            target="_blank"
            rel="noreferrer"
          >
            Terms & Conditions
          </MuiLink>
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Launched into the digital cosmos by{" "}
          <span role="img" aria-label="rocket">
            🚀
          </span>{" "}
          <MuiLink
            data-testid="footer-github-link"
            href="https://github.com/4theKnowledge"
            color="primary"
            underline="hover"
            target="_blank"
            rel="noreferrer"
          >
            Tyler Bikaun (4theKnowledge)
          </MuiLink>
        </Typography>
      </Container>
    </Box>
  );
};

export default Landing;
