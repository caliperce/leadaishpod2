import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Textarea,
  Button,
  Flex,
  useToast,
  Progress,
  Container,
  InputGroup,
  InputRightElement,
  useClipboard,
} from "@chakra-ui/react";

const App = () => {
  const [leads, setLeads] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [templateSubject, setTemplateSubject] = useState("");
  const [currentSubject, setCurrentSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [currentBody, setCurrentBody] = useState("");
  const [isTemplateSet, setIsTemplateSet] = useState(false);
  const toast = useToast();

  const { onCopy: onCopySubject } = useClipboard(currentSubject);
  const { onCopy: onCopyEmail } = useClipboard(
    leads[currentIndex]?.email || ""
  );
  const { onCopy: onCopyBody } = useClipboard(currentBody, {
    format: 'text/plain'
  });

  const showToast = (title) => {
    toast({
      title,
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "bottom-left",
    });
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      Papa.parse(file, {
        complete: (results) => {
          const parsedLeads = results.data.map((row) => ({
            name: row.name,
            company: row.company,
            email: row.email,
          }));
          setLeads(parsedLeads);
          updateEmailContent(parsedLeads[0]);
          showToast(`${parsedLeads.length} leads loaded successfully`);
        },
        header: true,
      });
    },
    [templateBody, templateSubject]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const updateEmailContent = (lead) => {
    if (lead) {
      const updatedSubject = templateSubject
        .replace(/{{first_name}}/g, lead.name)
        .replace(/{{company}}/g, lead.company);
      const updatedBody = templateBody
        .replace(/{{first_name}}/g, lead.name)
        .replace(/{{company}}/g, lead.company);
      setCurrentBody(updatedBody);
      setCurrentSubject(updatedSubject);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      updateEmailContent(leads[currentIndex - 1]);
      showToast("Moved to previous lead");
    }
  };

  const goToNext = () => {
    if (currentIndex < leads.length - 1) {
      setCurrentIndex(currentIndex + 1);
      updateEmailContent(leads[currentIndex + 1]);
      showToast("Moved to next lead");
    }
  };

  const handleSetTemplate = () => {
    if (templateSubject.trim() && templateBody.trim()) {
      setIsTemplateSet(true);
      showToast("Template set successfully");
    } else {
      toast({
        title: "Error",
        description:
          "Please enter both subject and email body template before proceeding.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleResetTemplate = () => {
    setIsTemplateSet(false);
    setLeads([]);
    setCurrentIndex(0);
    setCurrentBody("");
    setCurrentSubject("");
    setTemplateBody("");
    showToast("Template reset");
  };

  useEffect(() => {
    if (leads.length > 0) {
      updateEmailContent(leads[currentIndex]);
    }
  }, [currentIndex, leads]);

  const CopyButton = ({ onClick, children }) => (
    <Button
      size="sm"
      onClick={() => {
        onClick();
        showToast(`Copied to clipboard`);
      }}
      leftIcon={<Copy size={16} />}
    >
      {children}
    </Button>
  );

  return (
    <ChakraProvider>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" textAlign="center">
            Lead Email Co-pilot
          </Heading>
          {!isTemplateSet ? (
            <VStack spacing={6} align="stretch">
              <Box>
                <Text mb={2} fontWeight="bold">
                  Subject Template:
                </Text>
                <Input
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  placeholder="Enter subject template (you can use {{first_name}} and {{company}})"
                />
              </Box>
              <Box>
                <Text mb={2} fontWeight="bold">
                  Email Body Template:
                </Text>
                <Textarea
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  placeholder="Enter your email template here. Use {{first_name}} and {{company}} as placeholders."
                  minHeight="200px"
                />
              </Box>
              <Button colorScheme="blue" onClick={handleSetTemplate}>
                Set Template
              </Button>
            </VStack>
          ) : (
            <VStack spacing={6} align="stretch">
              <Box
                {...getRootProps()}
                borderWidth={2}
                borderStyle="dashed"
                borderRadius="md"
                p={6}
                textAlign="center"
                cursor="pointer"
                bg={isDragActive ? "gray.100" : "white"}
              >
                <input {...getInputProps()} />
                <Text>
                  {isDragActive
                    ? "Drop the CSV file here ..."
                    : "Drag 'n' drop a CSV file here, or click to select one"}
                </Text>
              </Box>
              {leads.length > 0 && (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text mb={2} fontWeight="bold">
                      Email:
                    </Text>
                    <InputGroup>
                      <Input
                        value={leads[currentIndex].email}
                        isReadOnly
                        bg="gray.100"
                      />
                      <InputRightElement width="4.5rem">
                        <CopyButton onClick={onCopyEmail}>Copy</CopyButton>
                      </InputRightElement>
                    </InputGroup>
                  </Box>
                  <Box>
                    <Text mb={2} fontWeight="bold">
                      Current Subject:
                    </Text>
                    <InputGroup>
                      <Input value={currentSubject} isReadOnly bg="gray.100" />
                      <InputRightElement width="4.5rem">
                        <CopyButton onClick={onCopySubject}>Copy</CopyButton>
                      </InputRightElement>
                    </InputGroup>
                  </Box>
                  <Box>
                    <Text mb={2} fontWeight="bold">
                      Current Email Body:
                    </Text>
                    <Textarea
                      value={currentBody}
                      isReadOnly
                      minHeight="200px"
                      bg="gray.100"
                      whiteSpace="pre-wrap"
                    />
                    <Flex justifyContent="flex-end" mt={2}>
                      <CopyButton onClick={onCopyBody}>Copy</CopyButton>
                    </Flex>
                  </Box>
                  <Flex justify="space-between" align="center">
                    <Button
                      onClick={goToPrevious}
                      isDisabled={currentIndex === 0}
                      leftIcon={<ChevronLeft />}
                    >
                      Previous
                    </Button>
                    <Text>
                      {currentIndex + 1} of {leads.length}
                    </Text>
                    <Button
                      onClick={goToNext}
                      isDisabled={currentIndex === leads.length - 1}
                      rightIcon={<ChevronRight />}
                    >
                      Next
                    </Button>
                  </Flex>
                  <Progress
                    value={((currentIndex + 1) / leads.length) * 100}
                    size="sm"
                    colorScheme="blue"
                  />
                </VStack>
              )}
              <Button colorScheme="red" onClick={handleResetTemplate}>
                Reset Template
              </Button>
            </VStack>
          )}
        </VStack>
      </Container>
    </ChakraProvider>
  );
};

export default App;
