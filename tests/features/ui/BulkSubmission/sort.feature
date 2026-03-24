@search @stable
Feature: Bulk Submission Sorting

Background:
And I start from a clean logged-in state

@frp
Scenario: Sort by calculated fee
Given I open an existing submission "019bfaba-b587-7aed-851f-217b6e7d0c99"
Then sorting can be done on claim summary headers
#
#  @frp
#  Scenario: Sort by calculated fee
#    Given I open an existing submission "019d06e8-3aba-76d3-bd00-ba686d4a8b2f"
#    Then sorting can be done on claim summary headers