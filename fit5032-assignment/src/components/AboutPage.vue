<template>
    <div class="about container my-5">
      <h1 class="text-center mb-4">About Golden Years Hub</h1>
  
      <section class="mb-5">
        <h2>Our Mission</h2>
        <p>
          At Golden Years Hub, our mission is to empower and enrich the lives of seniors by providing access to a comprehensive digital library. We believe in lifelong learning and aim to support the intellectual and recreational needs of our community through a wide range of books and resources.
        </p>
      </section>
  
      <section class="mb-5">
        <h2>Our Impact</h2>
        <p>
          Since our inception, Golden Years Hub has reached thousands of seniors across the globe, offering them a platform to explore new ideas, stay connected, and continue their love for reading. Our impact is measured not just in numbers, but in the smiles and satisfaction of our users.
        </p>
      </section>
  
      <section class="mb-5">
        <h2>Our Policy</h2>
        <p>
          Golden Years Hub is committed to maintaining the highest standards of integrity and respect. Our policies ensure that all content is accessible, inclusive, and appropriate for our diverse audience. We adhere strictly to copyright laws and prioritize user privacy in all our operations.
        </p>
      </section>
  
      <section>
        <h2>Frequently Asked Questions</h2>
        <div class="accordion" id="faqAccordion">
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                How can I access the digital library?
              </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                Simply create an account on our website and log in to access our full collection of books and resources.
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingTwo">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                Is there a fee to use Golden Years Hub?
              </button>
            </h2>
            <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                No, our services are completely free for all users. We are supported by generous donations and grants.
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingThree">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                How can I contribute to Golden Years Hub?
              </button>
            </h2>
            <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                We welcome contributions in the form of donations, volunteer work, and book recommendations. Please contact us to learn more.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  // No script needed for now
  </script>
  
  <style scoped>
  .about {
    padding: 20px;
  }
  
  .accordion-button {
    background-color: #f8f9fa;
  }
  
  .accordion-button:focus {
    box-shadow: none;
  }
  </style>
  