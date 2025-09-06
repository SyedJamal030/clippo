import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Box, Flex, Heading, Text, Link } from "@chakra-ui/react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Flex
      minH="100vh"
      width="100vw"
      alignItems="center"
      justifyContent="center"
      bg="gray.900"
    >
      <Box textAlign="center">
        <Heading as="h1" mb="4" fontSize="4xl" fontWeight="bold">
          404
        </Heading>
        <Text mb="4" fontSize="xl" color="gray.600">
          Oops! Page not found
        </Text>
        <Link
          href="/"
          color="blue.500"
          textDecoration="underline"
          _hover={{ color: "blue.700" }}
        >
          Return to Home
        </Link>
      </Box>
    </Flex>
  );
};

export default NotFound;
