Feature: Users API
  Scenario: Check GET /users endpoint
    When I send a GET request to "/users"
    Then the response status should be 200
    And the response should be an array